const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({

    post: { type: String, required: true, trim: true },
    favorites: { type: Number, default: 0 },
    author: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true }

}, {

    timestamps: true

})

module.exports = mongoose.model("Comments", commentSchema)