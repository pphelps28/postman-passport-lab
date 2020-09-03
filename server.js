const express = require('express')
const app = express()
app.use(express.urlencoded({ extended: true }))
////////////////////////////////
//mongoose Model Setup
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/jwt_user_example', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
const userSchema = new mongoose.Schema({
    user: String,
    password: String,
})
const User = mongoose.model('User', userSchema)

//run ONCE to create user for subsequent queries
User.create({ user: 'user', password: 'password' })
///////////////////////////////////
//passport setup















///////////////////////////////////////////////////////////////
//routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

app.post('/login', /*Issue JWT and send to browser*/)

app.get('/dashboard', /*verify JWT and redirect to dashboard*/)

app.listen(3000, () => console.log("listening on 3000"))