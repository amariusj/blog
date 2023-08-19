// Require and call express server
const express = require('express')
const app = express();

// Require additional configurations
require('dotenv').config()
const morgan = require('morgan')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')

// Call configurations via express
app.use(morgan('dev'))
app.use(cors())
app.use(fileUpload({
    useTempFiles: true
}))
app.use(cookieParser())
app.use(express.json())

// Connect to database
const URI = process.env.MONGODB_URI
const mongoose = require('mongoose')
mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => {
    if (err) console.log(err)
})

// Import routers
const userRouter = require('./routes/userRouter')
const imageRouter = require('./routes/imageRouter')
const categoryRouter = require('./routes/categoryRouter')
const postRouter = require('./routes/postRouter')
const sectionRouter = require('./routes/sectionRouter')
const blockRouter = require('./routes/blockRouter')

// Use the imported routers
app.use('/user', userRouter)
app.use('/api/images', imageRouter)
app.use('/api/category', categoryRouter)
app.use('/api/post', postRouter)
app.use('/api/section', sectionRouter)
app.use('/api/block', blockRouter)

// Add a simple welcome message from the server
app.get('/', (req, res) => {
    res.send('Welcome to my Blog!')
})

// Delcare the port
const PORT = 5000 || process.env.PORT

// Run the server on the port so it can be accessed there
app.listen(PORT, () => {
    console.log(`Your server is running on port: ${PORT}`)
})