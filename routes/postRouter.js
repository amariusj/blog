// require router from express for routing
const router = require('express').Router()

// Require the post controller for functionality
const postCtrl = require('../controllers/postCtrl')

// Require auth and authAdmin middleware
const auth = require('../auth/auth')
const authAdmin = require('../auth/authAdmin')

router.post('/create', auth, authAdmin, postCtrl.create)
router.get('/find', auth, authAdmin, postCtrl.find)
router.put('/update/:id', auth, authAdmin, postCtrl.update)
router.delete('/delete/:id', auth, authAdmin, postCtrl.delete)

module.exports = router