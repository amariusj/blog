const mongoose = require('mongoose')
const { ObjectId } = mongoose.SchemaTypes

const sectionSchema = new mongoose.Schema({

    blocks: [{ type: ObjectId, ref: "Blocks" }],
    grid: { type: String, required: true, trim: true },
    post: { type: ObjectId, ref: "Posts", required: true }

}, {

    timestamps: true

})

module.exports = mongoose.model("Sections", sectionSchema)