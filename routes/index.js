const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');

router.get('/phone', (req, res) => {
    res.send("Please open this website on your phone's browser.");
})

router.get('/', (req, res) => { res.redirect('/register') })

router.get('/register', (req, res) => {
    res.render('register')
});

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'safestride413@gmail.com',
        pass: `${process.env.EMAIL_PASSWORD}`
    }
});

router.post('/register', async (req, res) => {
    let token = Math.floor(Math.random() * 1000000)
    const newUser = new User({
        name: req.body.name,
        umass_email: req.body.umass_email,
        password: req.body.password,
        phone_number: req.body.phone_number,
        verified: false,
        verify_token: token
    });
    let user = await newUser.save();

    var mailOptions = {
        from: 'safestride413@gmail.com',
        to: `${user.umass_email}`,
        subject: 'Verification Email',
        html: `<p>Your SafeStride verification token is ${token}.</p>`
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
            res.json({ success: false, error: error })
        } else {
            res.json({success: true, accessToken: user._id})
        }
    });
})

router.get('/dashboard', (req, res) => {
    res.render('home')
})

router.get('/verify', (req, res) => {
    res.render('verify')
})

router.get('/trustedcontacts', (req, res) => {
    res.render('trustedcontacts')
})

router.get('/stridees', (req, res) => {
    res.render('stridees')
})

router.get('/striders', (req, res) => {
    res.render('striders')
})

router.get('/session', (req, res) => {
    res.render('session')
})

router.get('/review', (req, res) => {
    res.render('review')
})

module.exports = router