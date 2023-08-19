const Categories = require('../models/categoryModel')
const Posts = require('../models/postModel')

const categoryCtrl = {

    create: async (req, res) => {

        try {

            // Grab the name from the request body
            const { name } = req.body

            // If the name was not inserted, send an error
            if (!name) return res.status(400).json({msg: "Please add a name for your category."})

            // Check if the category already exists
            const category  = await Categories.findOne({name})

            // If the category already exists, send an error
            if (category) return res.status(400).json({msg: "A category already exists with this name."})

            // Create a new category inside the database
            const newCategory = new Categories({name}).save()

            // Return a successful message            
            return res.json({msg: "New category created."})

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    findAll: async (req, res) => {

        try {

            // Find all categories
            const categories = await Categories.find()

            // Return all categories
            return res.json({categories})

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    update: async (req, res) => {

        try {

            // Grab the name from the request body
            const { name } = req.body 

            // If the name field was not submitted, send an error
            if (!name) return res.status(400).json({msg: "Please insert a name for your category."})

            // Find and update the category with the new information submitted
            const category = await Categories.findByIdAndUpdate(req.params.id, { name })

            if (!category) return res.status(400).json({msg: "This category no longer exists. Please refresh and try again."})

            // Return a successful message to the client
            return res.json({msg: "Category updated."})

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    },
    delete: async (req, res) => {

        try {

            // Look for any posts that use this category
            const post = await Posts.findOne({category: req.params.id})

            // If a post exists, send an error requesting they delete all posts before deleting the category
            if (post) return res.status(400).json({msg: "Please delete all posts associated with this category before deleting the category."})

            // Find and delete the category
            const category = await Categories.findByIdAndDelete({_id: req.params.id})

            // If there is an error with finding and deleting the category, send an error
            if (!category) return res.status(400).sjon({msg: "We were unable to find and delete the category."})

            // Return a successful message
            return res.json({msg: "Category successfully deleted."})

        } catch (err) {

            return res.status(500).json({msg: err.message})

        }

    }

}

module.exports = categoryCtrl