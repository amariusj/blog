const router = require('express').Router()
const blockCtrl = require('../controllers/blockCtrl')

const auth = require('../auth/auth')
const authAdmin = require('../auth/authAdmin')

router.post('/create/:id', auth, authAdmin, blockCtrl.create)

module.exports = router