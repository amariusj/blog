const Blocks = require('../models/blockModel')
const Sections = require('../models/sectionModel')

const blockCtrl = {

    create: async (req, res) => {

        try {

            // Grab the necessaru fields from the request body
            const { type, content } = req.body

            // Grab the section ID from the request parameter
            const { id } = req.params

            // Verify if a section can be found
            const section = await Sections.findById(id)

            // If a section cannot be found, send an error
            if (!section) return res.status(400).json({msg: "Unbable to locate a section to add this block to. Please try re-freshing your screen."})

            // Create a new block inside the database
            const newBlock = new Blocks({
                type,
                content,
                section: section._id
            })

            // Save the new block
            await newBlock.save()

            // Add the block to the section it was created on
            const updatedSection = await Sections.findByIdAndUpdate( id, {
                $push: {
                    blocks: newBlock._id
                }
            }, {
                new: true
            })

            //Return a success message to the client
            return res.json({
                msg: "A new block was successfully created!",
                newBlock,
                updatedSection
            })

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    }

}

module.exports = blockCtrl