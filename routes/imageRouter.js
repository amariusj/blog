// Import Express router for handling routing
const router = require('express').Router()

// Import the images model schema
const Images = require('../models/imageModel')

// Require file share
const fs = require('fs')

// Import sharp for blurring and lowering image res
const sharp = require('sharp')

// Import Cloudinary - Uploader for images
const cloudinary = require('cloudinary')

// Import authentication routes to verify user has necessary access
const auth = require('../auth/auth')
const authAdmin = require('../auth/authAdmin')

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})


// Create router for uploading an image
router.post('/upload', auth, authAdmin, async (req, res) => {

    try {

        // Send an error if no file was submitted
        if (!req.files || Object.keys(req.files).length === 0) return res.status(400).json({msg: "No files were uploaded."})

        // Store the submitted file(s) to a variable
        const { photo } = req.files

        //If the file size is larger than 5MB...
        if (photo.size > 1024*1024*5) {

            // Remove the photo
            removeTmp(photo.tempFilePath)

            // Send an errpr
            return res.status(400).json({msg: "Image size is too large."})

        }

        // If the file type is not supported...
        if (
            photo.mimetype !== 'image/jpeg' && 
            photo.mimetype !== 'image/jpg' &&
            photo.mimetype !== 'image/png' &&
            photo.mimetype !== 'image/webp'
        ) {

            // Remove the photo
            removeTmp(photo.tempFilePath)

            // Send an error
            return res.status(400).json({msg: "File type is not supported."})
        }

        // store the result of the compressed, uploaded, and saved image
        const finalizedImage = await compressUploadAndSave(photo)

        // Return the image and a success message
        return res.json({
            msg: "Image successfully uploaded.",
            finalizedImage
        })


    } catch (err) {

        return res.status(500).json({msg: err.message})

    }

})

router.delete('/remove', auth, authAdmin, async (req, res) => {

    try {

        // Grab the public ID from the request body
        const { public_id } = req.body

        // If no image was submitted to the form, send an error
        if (!public_id) return res.status(500).json({msg: "No images were selected"})

        // Locate the image inside the database
        const image = await Images.findOne({public_id})

        // If no image is found, send an error
        if (!image) return res.status(400).json({msg: "No image was found with the public_id provided"})

        // Remove the image from cloudinary
        await cloudinary.v2.uploader.destroy(public_id, err => {
            if (err) throw err
        })

        // Remove the low res version from cloyudinary
        await cloudinary.v2.uploader.destroy(image.lowres_public_id, err => {
            if (err) throw err
        })

        // Delete the image document from the database
        await Images.findOneAndDelete({public_id})

        // Return a success message to the client
        return res.json({msg: "Images successfully deleted."})


    } catch (err) {

        return res.status(500).json({msg: err.message})

    }

})

// Compress, upload, and save the image 
compressUploadAndSave = async (image) => {

    // Create a variable to store image data
    const imageData = {}

    // Upload the photo to cloudinary
    await cloudinary.v2.uploader.upload(image.tempFilePath,
        {folder: 'blog', public_id: image.name},
        (err, result) => {

            // If there's an error, throw an error
            if (err) throw err

            // Grab the public id and secure url
            const { public_id, secure_url } = result

            // Add the public id and secure URL to image data
            imageData.public_id = public_id
            imageData.secure_url = secure_url

        })

    // Compress the image using sharp
    await sharp(image.tempFilePath).jpeg({ quality: 10 }).blur(50)
    .toFile(`tmp/compressed-${image.name}`)

    // Upload the compressed image to cloudinary
    await cloudinary.v2.uploader.upload(`./tmp/compressed-${image.name}`,
    {folder: 'blog', public_id: `compressed-${image.name}`},
    (err, result) => {

        // If there's an error, throw an error
        if (err) throw err

        // Grab the public id and secure url
        const { public_id, secure_url } = result

        // Add the public id and secure URL to image data
        imageData.lowres_public_id = public_id
        imageData.lowres_secure_url = secure_url

    })

    // Remove the image now that it's uploaded
    removeTmp(image.tempFilePath)
    removeTmp(`./tmp/compressed-${image.name}`)

    // Check to see if the image already exists in the database
    const existingImage = await Images.findOne({public_id: `blog/${image.name}`})

    // If the image doesn't already exist, create a new image
   if (!existingImage) {

        // Store the image and its compressed version inside the database
        const newImage = new Images(imageData)

        // Save the new image
        await newImage.save()

        // Return the new image document to the client
        return newImage

   } else {

        
        // Return the existing image document to the client
        return existingImage

   }

}

// Remove the file/image
removeTmp = (path) => {

    fs.unlink(path, err => {
        if (err) throw err
    })

}

module.exports = router