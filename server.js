require('dotenv').config()

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


///////////////////////////////////
//passport setup

const jwt = require('jsonwebtoken')
const {Strategy, ExtractJwt} = require('passport-jwt')
const passport = require('passport')

app.use(passport.initialize())

//defining strategy options
let option = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_KEY
}

//set passport to use JWT Strategy
passport.use(new Strategy(option, (token, done) => {
    console.log('in middleware token: ', token)
    //when passport receives the token do this:
    User.findOne({_id: token.sub}, async (err, resp) => {
        //if there is an error
        console.log('searching for user')
        if(err) {
            console.log('from err block',resp.headersSent)
            //pass the error along, and set the user to false
            return done(err, false)
        }
        if(resp) {
            console.log('should be user ', resp)
            //if we get a user object back set error to null, and send user obj through
            return done(null, resp)
        } else {
            //If there is no error, but also no matching user, create a new user:
            let newUser = await User.create({
                user: token.user,
                password: token.password
            })

            console.log('from passport strategy, newUser: ', newUser)

            return done(null, newUser)
        }
    })
}))


//token issuer

function issueToken(user) {
    let newToken = {
        sub: user._id,
        iat: Date.now()
    }

    const signed = jwt.sign(newToken, process.env.SECRET_KEY, {expiresIn: '1d'})

    return {
        token: signed,
        expires: '1d',
    }
}

///////////////////////////////////////////////////////////////
//routes
app.get('/', (req, res) => {
    console.log(req.headers)
    res.sendFile(__dirname + '/public/index.html')
})

app.post('/login', async (req, res, next) => {
    //create a user object based on req.body from form
    let userObj = req.body;

    //query the DB search for matching user by username
    await User.findOne({user: userObj.user}).then((user) => {
        //if there is no matching user
        if(!user) {
            res.status(401).json({success: false, msg: "no user found"})
        }
        //if there is a user check password entered in form , against pasword in DB
        if(userObj.password === user.password) {
            //issue a token
            let userToken = issueToken(user)
            //send token across
            //res.status(200).json({success: true, token: userToken.token, expires: userToken.expires})
            //console.log(userToken.token)

            req.headers.authorization = 'Bearer ' + userToken.token
            next()
            //console.log(res.get('Authorization'))


        } else {
            //Otherwise auth fails and no token is generated
            res.status(401).json({success: false, msg: "Incorrect Password"})
        }
    })
}, passport.authenticate('jwt', {session: false, 
    successRedirect: '/dashboard',
    failureRedirect: '/'}))

app.get('/dashboard', /*passport.authenticate('jwt', {session: false}),*/ (req, res) => {
    console.log(req.headers)
    res.status(200).json({success: true, msg: 'Great Success!'})
})

app.listen(3000, () => console.log("listening on 3000"))