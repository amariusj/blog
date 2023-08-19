// Import express's router functionality
const router = require('express').Router()

// Import the controller handling all functionality for routes
const userCtrl = require('../controllers/userCtrl')

// Import the authentication middleware
const auth = require('../auth/auth')

// Create a route for registering a user
router.post('/register', userCtrl.register)

// Create a route for generating a new access token
router.get('/refresh_token', userCtrl.refresh)

// Creates a route for logging an existing user in
router.post('/login', userCtrl.login)

// Creates a route for logging out a user
router.get('/logout', userCtrl.logout)

// Creates a route to get user information
router.get('/infor', auth, userCtrl.infor)

// Creates a route to delete the user
router.delete('/delete', auth, userCtrl.delete)

// Creates a route to update the user
router.put('/update', auth, userCtrl.update)

// Export the User Router
module.exports = router