const express = require('express')
const { default: mongoose } = require('mongoose')
const router = express.Router()
const User = require('../Models/User')
const { body, validationResult } = require('express-validator');
const { findOne } = require('../Models/User');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const fetchuser = require('../Middleware/Fetchuser');

const jwt_secret = "thisisasecret"

//for signup
router.post('/signup', [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('name').isLength({ min: 3 })
]
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            let user = await User.findOne({ "email": req.body.email })
            if (user) {
                return res.status(400).json("user with this email already exists")
            }
            const salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(req.body.password, salt);
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: hash,
            })
            const data = {
                user: {
                    id: user.id
                }
            }

            var token = jwt.sign(data, jwt_secret);
            res.json(token)
        }
        catch (error) {
            console.log(error.message)
            res.status(500).json('some error occured')
        }
    })


//for login
router.post('/login', [
    body('email', 'Minimum 3 characters required').isEmail(),
    body('password').exists(),
]
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { email, password } = req.body
            let user = await User.findOne({ "email": email })
            if (!user) {
                return res.status(400).json("user with this details does not exists")
            }
            const passwordCompare = await bcrypt.compare(password, user.password)
            if (!passwordCompare) {
                return res.status(400).json("user with this details does not exists")
            }
            const data = {
                user: {
                    "id": user.id
                }
            }
            var token = jwt.sign(data, jwt_secret);
            res.json(token)
        }
        catch (error) {
            console.log(error.message)
            res.status(500).json('some error occured')
        }
    })


// get all user
router.get('/fetchalluser', fetchuser, async (req, res) => {
    const user = await User.find({}).select("-password")
    res.json(user)
})

// delete user
router.delete('/deleteuser/:id', fetchuser, async (req, res) => {
    await User.findByIdAndDelete(req.params.id)
    res.json("deleted")
})

// update user
router.put('/updateuser/:id', fetchuser, async (req, res) => {
    const newUser = {};
    if (req.body.name) { newUser.name = req.body.name }
    if (req.body.email) { newUser.email = req.body.email }
    if (req.body.password) { newUser.password = req.body.password }
    let user = await User.findById(req.params.id)
    if (!user) {
        res.status(404).json("not found")
    }
    user = await User.findByIdAndUpdate(req.params.id, { $set: newUser }, { new: true }).select("-password")
    res.json(user)
})




module.exports = router