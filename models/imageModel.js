const mongoose = require('mongoose')

const imagesSchema = new mongoose.Schema({

    public_id: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    secure_url: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    lowres_public_id: {
        type: String,
        trim: true,
        unique: true
    },
    lowres_secure_url: {
        type: String,
        trim: true,
        unique: true
    },
    category: {
        type: String
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Images', imagesSchema)