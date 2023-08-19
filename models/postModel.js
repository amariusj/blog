// Requires mongoose for creating the schema
const mongoose = require('mongoose')
const { ObjectId } = mongoose.SchemaTypes

// Create the schema for posts
const postSchema = new mongoose.Schema({

    title: { type: String, required: true, trim: true },
    headerImage: { type: Object, required: true,trim: true },
    sections: [{ type: ObjectId, ref: "Sections" }],
    category: { type: String, trim: true, required: true },
    author: { type: Object, required: true, trim: true },
    post_id: { type: String, required: true, trim: true, unique: true },
    summary: { type: String, required: true, trim: true },
    favorites: { type: Number, default: 0 },
    comments: { type: Array, default: [] },
    published: { type: Boolean, default: false },
    tags: { type: Array, default: [] }

}, {
    timestamps: true
})

module.exports = mongoose.model('Posts', postSchema)