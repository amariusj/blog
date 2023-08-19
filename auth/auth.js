const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {

    // Grab the token from the Authorization header
    const token = req.header("Authorization")

    // If a token cannot be found, send an error
    if (!token) return res.status(400).json({msg: "Please login or register."})

    // Verify the token is valid
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {

        // If the token is not valid, send an error
        if (err) return res.status(400).json({msg: "Invalid Authorization"})

        // Create a new object in the request body called user that takes the
        // payload's information
        req.user = payload
        next()

    })

}

module.exports = auth