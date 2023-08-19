const router = require('express').Router()
const sectionCtrl = require('../controllers/sectionCtrl')

const auth = require('../auth/auth')
const authAdmin = require('../auth/authAdmin')

router.post('/create/:id', auth, authAdmin, sectionCtrl.create)
router.get('/find/:id', sectionCtrl.find)
router.put('/update/:id', sectionCtrl.update)
router.delete('/delete/:id', auth, authAdmin, sectionCtrl.delete)

module.exports = router