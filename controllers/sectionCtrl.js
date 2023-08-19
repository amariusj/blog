const Sections = require('../models/sectionModel')
const Posts = require('../models/postModel')
const Blocks = require('../models/blockModel')

const sectionCtrl = {

    create: async (req, res) => {

        try {

            // Grab the grid field from the request body
            const { grid } = req.body

            // If no grid is porvided, send an error
            if (!grid) return res.status(400).json({msg: "Please select a grid option."})

            // Grab the post ID from the request parameter
            const { id } = req.params

            // Locate the post the section is being created for
            const post = await Posts.findById(id)

            // If the post cannot be found, send an error
            if (!post) return res.status(400).json({msg: "A post could not be found. Please try refreshing your page."})

            // Create an object to store the new section data 
            const newSection = {
                post: post._id,
                grid
            }

            // Create and save the new section 
            const section = await new Sections(newSection).save()

            // If there's an error with creating the section, send an error
            if (!section) return res.status(400).json({msg: "There was an issue with creating your section."})

            // Add the newly created section to the post
            const updatedPost = await Posts.findByIdAndUpdate(id, {
                $push: {
                    sections: section._id
                }
            }, {
                new: true
            })

            // Return a successful message
            return res.json({
                msg: 'Section successfully created.',
                section,
                updatedPost
            })

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    find: async (req, res) => {

        try {

            // Find all sections under the post you're viewing
            const sections = await Sections.find({post: req.params.id})

            // Return the sections to the client
            return res.json(sections)

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    update: async (req, res) => {

        try {

            // Grab the grid field from the request body
            const { grid } = req.body

            // If the grid was not submitted, send an error
            if (!grid) return res.status(400).json({msg: "Please select a grid option."})

            // Grab the section id from the request parameter
            const { id } = req.params

            // Locate the section
            const section = await Sections.findById(id)

            // Check if blocks have already been added to the section
            if (section.blocks.length > 0) {

                // If the section has blocks, check how many blocks are added
                const blocks = section.blocks.length

                // If they are switching to a single-column section, verify they have no more than one block
                if (grid === 'single-column' && blocks > 1)
                    return res.status({msg: "You must delete any extra blocks before moving to a single-column grid. You can only have one block for a single-column section."})

                // If they are switching to a double-column section, verify they have no more than two blocks
                if (grid === 'double-column' && blocks > 2)
                    return res.status({msg: "You must delete any extra blocks before moving to a double-column grid. You can only have two blocks for a double-column section."})

            }

            // Update the section
            section.grid = grid

            // Save the updated section
            await section.save()

            return res.json({
                msg: 'Section successfully updated.',
                section
            })

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    delete: async (req, res) => {

        try {

            // Find the section
            const section = await Sections.findById(req.params.id)

            // If the section includes blocks...
            if (section.blocks.length > 0) {

                // For each block included...
                section.blocks.map( async block => {

                    // Find and delete the block
                    await Blocks.findByIdAndDelete(JSON.stringify(block._id))

                })

            }

            // Find the post for this section
            const post = await Posts.findById(section.post)

            // Find the section within the post's section array
            const index = post.sections

            post.sections.map( section => {

                if (`"${req.params.id}"` == JSON.stringify(section._id)) console.log(`a match!`)

            })

            // Delete the section
            //await Sections.findByIdAndDelete(req.params.id)

            // Return a success message to the client
            return res.json({msg: 'Section successfully deleted.', index})

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    }

}

module.exports = sectionCtrl