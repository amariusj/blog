// Requires mongoose for creating the schema
const mongoose = require('mongoose')

// Create the schema for categories
const categorySchema = new mongoose.Schema({

    name: { 
        type: String,
        required: true,
        trim: true,
        unique: true
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('Categories', categorySchema)