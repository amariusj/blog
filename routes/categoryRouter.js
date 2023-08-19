const router = require('express').Router()
const categoryCtrl = require('../controllers/categoryCtrl')
const auth = require('../auth/auth')
const authAdmin = require('../auth/authAdmin')

router.post('/create', auth, authAdmin, categoryCtrl.create)
router.get('/find', auth, authAdmin, categoryCtrl.findAll)
router.put('/update/:id', auth, authAdmin, categoryCtrl.update)
router.delete('/delete/:id', auth, authAdmin, categoryCtrl.delete)

module.exports = router
