const Users = require('../models/userModel')

const authAdmin = async (req, res, next) => {

    try {

        // Find the user using the request user object
        const user = await Users.findById(req.user.id)

        // Verify the user has the admin role
        if (user.admin == false) return res.status("Admin resources access denied.")

        // Send the client to the next middleware function
        next()

    } catch (err) {

        return res.status(500).json({msg: err.message})

    }

}

module.exports = authAdmin