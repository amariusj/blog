const Posts = require('../models/postModel')
const Users = require('../models/userModel')
const Sections = require('../models/sectionModel')
const Blocks = require('../models/blockModel')

const postCtrl = {

    create: async (req, res) => {

        try {

            // Grab the necessary fields from the request body
            const { 
                title, 
                headerImage, 
                category, 
                post_id, 
                summary, 
                tags
             } = req.body

             // If any of the necessary fields are not inserted, send an error
             if ( !title, !category, !post_id, !summary, !headerImage ) return res.status(400).json({msg: "Please fill out all required fields."})

             // Verify the post does not already exist
             const existingPost = await Posts.findOne({post_id})
             if (existingPost) return res.status(400).json({msg: "A post with this ID already exists."})

             // Grab and name and ID from the logged user
             const author = await Users.findById(req.user.id, '_id username fullName')

             // Create a new post inside the database
             const postData = {
                title: title.toLowerCase(),
                headerImage,
                category,
                post_id,
                summary,
                author
             }

             // If tags are included, add them
             let lowerCaseTags = []
             if (tags) {
                
                // Make each tag lowercase
                tags.map( tag => lowerCaseTags.push(tag.toLowerCase()))

                // Add the tags array to the postData
                postData.tags = lowerCaseTags

             }

             // Save the new post
             const post = await new Posts(postData).save()

            return res.json({msg: "Post successfully created.", post})

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    find: async (req, res) => {

        try {

            // Find all posts were published is set to true
            const features = new APIfeatures(Posts.find().populate('sections'), req.query)
                .filtering().sorting().paginating()

            // Run the query for posts
            const postQuery = await features.query

            // Create a variable to hold all sections
            const sections = []

            // Run the query for all sections per post and their corresponding blocks
            const query = await postQuery.map( async post => {

                return await post.sections.map( async section => {

                    // Locate the section
                    let item = await Sections.findById(section._id).populate('blocks')
                    return item
    
                })

            }).then(res => {
                console.log(res)
            })

            console.log(query)

            // Return all posts to the client
            return res.json({
                status: 'success',
                result: postQuery.length,
                postQuery,
                sections
            })

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    update: async (req, res) => {

        try {

            // Grab the ID parameter from the request
            const { id } = req.params

            // Grab required fields from the form
            const {
                title,
                headerImage,
                category,
                summary,
                tags,
                published
            } = req.body

            // If the necessary fields are not submitted, send an error
            if (!title, !headerImage, !category, !summary ) return res.status(400).json({msg: "Please fill out all required fields."})

            // If they are publishing the post...

            let singleColumnError = false
            let doubleColumnError = false
            let tripleColumnError = false

            if (published) {

                // Find the post they're updating
                const post = await Posts.findById(id)

                // Make sure they have sections
                if (post.sections.length === 0) return res.status(400).json({msg: "You must include at least one section before publishing your post."})

                // Make sure all sections have blocks filled per their grid selection
                post.sections.map( section => {

                    // If they do not have a block for all single column sections, send an error
                    if ( section.grid === 'single-column' ) {

                        if (section.blocks.length < 1) singleColumnError = true

                    }

                    // If they do not have two blocks for all double-column sections, send an error
                    if ( section.grid === 'double-column' ) {

                        if (section.blocks.length < 2) doubleColumnError = true

                    }

                    // If they do not have three blocks for all triple-column sections, send an error
                    if ( section.grid === 'triple-column' ) {

                        if (section.blocks.length < 3) tripleColumnError = true

                    }

                })

            }

            if (singleColumnError) return res.status(400).json({msg: "You must include a block for all single-column sections."})
            if (doubleColumnError) return res.status(400).json({msg: "You must include two blocks for all double-column sections."})
            if (tripleColumnError) return res.status(400).json({msg: "You must include three blocks for all triple-column sections."})

            // Store the updated data into an object
            const newData = {
                title,
                headerImage,
                category,
                summary,
                published
            }

            // If they include tags, and that to the object
            if (tags) newData.tags = tags

            // If they did not include tags, make the tags empty
            if (!tags) newData.tags = []

            // Find and Update the post with the new info submitted
            const update = await Posts.findByIdAndUpdate({_id: id}, newData)

            // If there's an error, send it to the client
            if (!update) return res.status(400).json({msg: "We were unable to update the document."})

            // Return a success message
            return res.json({
                msg: "Post successfully updated!",
                update
            })

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    delete: async (req, res) => {

        try {

            // Grab the ID parameter from the request
            const { id } = req.params

            // Find all sections that are under this post
            const sections = await Sections.find({post_id: id})

            // If sections exist under this post, delete each
            if (sections) {

                // Map through each section and...
                sections.map( async section => {

                    // Check for any blocks added to this section
                    const blocks = await Blocks.find({section: section._id})

                    // If blocks are able to be found, delete each
                    if (blocks) {

                        // Map through each block and...
                        blocks.map( async block => {

                            // Delete the block
                            await Blocks.findByIdAndDelete(block._id)

                        })

                    }

                    // After all blocks have been deleted, delete the section
                    await Sections.findByIdAndDelete(section._id)

                })

            }

            // Now that all sections are deleted, delete the post
            const post = await Posts.findByIdAndDelete(req.params.id)

            // If there's an error with finding and deleting the post, send an error
            if (!post) return res.status(400).json({msg: "We were unable to find a post to delete."})

            // Return a successful message to the client
            return res.json({msg: "Post successfully deleted."})

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    }

}

// Create a class for handling filtering, sorting, and paginating
class APIfeatures {

    // create the constructor for the class and pass in the arguments
    constructor(query, queryString) {

        // query is the query we call to mmongoose when pulling the posts
        this.query = query

        // queryString is the request query object from the request URL
        this.queryString = queryString

    }

    // Add a filtering method to filter the posts based on regex
    filtering() {

        // Grab the query object from the URL
        const queryObj = {...this.queryString}

        // Create an array of the queries to exclude from the query string
        const excludedFields = ['page', 'sort', 'limit']

        // Remove the excluded fields from the query object
        excludedFields.forEach( field => delete(queryObj[field]) )

        // Convert the query object into a string
        let queryStr = JSON.stringify(queryObj)

        // Add regex to the query string
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match)

        // Parse the query string back to JSON
        queryStr = JSON.parse(queryStr)

        // Run the Posts.find() method passing in the query object
        this.query.find(queryStr)

        // Return the new value of the arguments
        return this

    }

    // Add a sorting method in case a sort query is added
    sorting() {

        // If within the query, there's a sort parameter
        if (this.queryString.sort) {

            // Concatenate the strings within the sort array by removing any commans
            // within the array's strings, then joining them with a space between them,
            // and set this equal to a variable
            const sortBy = this.queryString.sort.split(',').join(' ')

            // Set the Posts.find() to Posts.find().sort(sortBy)
            this.query = this.query.sort(sortBy)

        } else {

            // Set the sort query equal to createdAt desc
            this.query = this.query.sort('-createdAt')

        }

        // Return the new query
        return this

    }

    // Add a paginating method to show a limit of posts
    paginating() {

        // Multiply the page query by 1 or set it to 1
        const page = this.queryString.page * 1 || 1

        // Multiply the limit query by 1 or set it to 6 
        const limit = this.queryString.limit * 1 || 6

        // Determine the amount of posts to skip when querying for posts
        const skip = (page - 1) * limit

        // Run the Posts.find() query adding the skip and limit methods
        this.query = this.query.skip(skip).limit(limit)

        // Return the new changes
        return this

    }

}

module.exports = postCtrl