// Import the Users Schema model to access and control
// that portion fo the database
const Users = require('../models/userModel')

// Import bcrypt to allow browser hashing and comparing
const bcrypt = require('bcrypt')

// Import Json Web Token for signing and verifying tokens
const jwt = require('jsonwebtoken')

// Create an object that stores all user controller functionality
const userCtrl = {

    // Register a user
    register: async (req, res) => {

        try {

            // Grab the request body parameters from the client
            const { email, username, password, confirmPassword, fullName } = req.body

            // Verify all required  fields have been filled out
            if (!email || !username || !password || !confirmPassword) return res.status(400).json({msg: "Please fill out all required fields"})

            // Verify a user does not already exist with that email or username

            // Check for a user with the email provided
            const verifyEmail = await Users.findOne({email})

            // Check for a user with the username provided
            const verifyUsername = await Users.findOne({username})

            // Send an error if either could be found
            if (verifyEmail) return res.status(400).json({msg: "A user with that email address already exists."})
            if (verifyUsername) return res.status(400).json({msg: "A user has already taken that username."})

            // Add Regular Expressions for the password to ensure it's secure

            // Verify password is at least 8 characters long
            if (password.length < 8) return res.status(400).json({msg: "Password must be at least 8 characters long."})

            // Verify the password contains at least one uppercase letter
            if (!password.match(/[A-Z]/)) return res.status(400).json({msg: "You must include at least one uppercase letter."})

            // Verify the password contains at least one lowercase letter
            if (!password.match(/[a-z]/)) return res.status(400).json({msg: "You must include at least one lowercase letter."})

            // Verify the password contains at least one number
            if (!password.match(/[0-9]/)) return res.status(400).json({msg: "You must include at least one number."})

            // Verify the password contains at least one special character
            if (!password.match(/[!@#$%^&*()_\-+=]/)) return res.status(400).json({msg: "You must include at least one special character."})

            // Verify the password matches the confirmPassword field
            if (password != confirmPassword) return res.status(400).json({msg: "Your confirmation password does not match the password entered."})

            // Encrypt the password entered
            const hashedPassword = await bcrypt.hash(password, 10)

            // Data for new user
            const userData = {
                email,
                username,
                password: hashedPassword,
            }

            // If they entered a first or last name, add that to their user data
            if (fullName) userData.fullName = fullName.toLowerCase()

            // Create the new user
            const newUser = new Users(userData)

            // Save the new user
            await newUser.save()

            // Create an access token for the new user
            const accessToken = createAccessToken({id: newUser._id})

            // Create a refresh token for the new user
            const refreshToken = createRefreshToken({id: newUser._id})

            // Create a cookie session to verify the refresh token when later requested
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token'
            })

            return res.json({msg: "New user successfully registered.", accessToken})

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    // Generate a new access token
    refresh: async (req, res) => {
        
        try {

            // Grab the refresh token from the request cookie
            const { refreshToken } = req.cookies

            // If the refreshToken cookie could not be found, send an error
            if (!refreshToken) return res.status(400).json({msg: "Please login or register."})

            // Verify the refresh token in order to generate a new access token
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {

                // If the refresh token could not be verified, send an error
                if (err) return res.status(400).json({msg: "Please login or register."})
                
                // Create a new access token for the user
                const accessToken = createAccessToken({id: payload.id})

                // Return the new access token to the user
                return res.json({accessToken, refresh_token_payload: payload})

            })

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    login: async (req, res) => {

        try {

            // Grab the request parameters from the req body
            const { emailOrUsername, password } = req.body

            // Verify all fields have been submitted
            if (!emailOrUsername || !password) return res.status(400).json({msg: "Please fill out all required fields."})

            // If a user does not exist with that username or email address, send an error to the client
            let user
            const email = await Users.findOne({email: emailOrUsername})
            const username = await Users.findOne({username: emailOrUsername})
            if (!email && !username) return res.status(400).json({msg: "We could not find a user with the provided credentials."})

            // Verify they have the correct password

            // If they entered their email address, use this code
            if (email) {

                const isMatch = await bcrypt.compare(password, email.password)
                if (!isMatch) return res.status(400).json({msg: "Password is incorrect."})
                user = email

            // Else, if they entered their username, use this code
            } else if (username) {

                const isMatch = await bcrypt.compare(password, username.password)
                if (!isMatch) return res.status(400).json({msg: "Password is incorrect."})
                user = username

            }

            // If they have the correct password, generate an access token, refresh token, and cookie for refresh token
            const accessToken = createAccessToken({id: user._id})
            const refreshToken = createRefreshToken({id: user._id})
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token'
            })

            // Return both the access token and a successfully logged message to client
            return res.json({msg: "User successfully logged in!", accessToken})

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    logout: async (req, res) => {

        try {

            // Clear the cookie in the client. With the cookie now gone, they cannot
            // generate a new access token, and their existing access token can
            // be removed in the client
            res.clearCookie('refreshToken', {
                path: '/user/refresh_token'
            })

            // Return a successful message to the client
            return res.json({msg: "Successfully logged out."})

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    infor: async (req, res) => {

        try {

            // Find the user using the id from the payload. Be sure to exclude the password
            const user = await Users.findById(req.user.id).select('-password')

            // If the user could not be found, send an error
            if (!user) return res.status(400).json({msg: "User could not be found in our system."})

            // Return the user information to the client
            return res.json({user})

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    delete: async (req, res) => {

        try {

            // Grab the user based on the req user object
            const user = await Users.findByIdAndDelete(req.user.id)

            // If the user cannot be found, send an error
            if (!user) return res.status(400).json({msg: "The user could not be found in our system."})

            // Return a success message to the client
            return res.json({msg: "User successfully deleted."})

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    update: async (req, res) => {

        try {

            // Grab the URL parameters from the request body
            const { email, username, password } = req.body

            // Check if a user already exists with the email or username submitted
            const userByEmail = await Users.findOne({email})
            const userByUsername = await Users.findOne({username})

            // If a user already exists and isn't the user making this request, send an error
            if (userByEmail && req.user.id != userByEmail._id) return res.status(400).json({msg: "A user with that email address already exists."})
            if (userByUsername && req.user.id != userByUsername._id ) return res.status(400).json({msg: "A user with that username already exists."})

            // Rehash the user's password
            const hashedPassword = await bcrypt.hash(password, 10)

            // Create a data object to store the new user information
            const newUserData = {}

            // Add all submitted data into the new user data object
            for (const key in req.body) {
                newUserData[key] = req.body[key]
            }

            // Update the password to the hashed version
            newUserData.password = hashedPassword

            // Save the user's new information
            await Users.findByIdAndUpdate(req.user.id, newUserData)

            // Return a success message to the client
            return res.json({msg: "User successfully updated"})

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    }

}

const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
}

const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}

module.exports = userCtrl