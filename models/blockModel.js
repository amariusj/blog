const mongoose = require('mongoose')

const blockSchema = new mongoose.Schema({

    type: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    section: { type: String, required: true }

}, {

    timestamps: true

})

module.exports = mongoose.model("Blocks", blockSchema)