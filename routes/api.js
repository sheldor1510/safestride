const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stride = require('../models/Stride');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'safestride413@gmail.com',
        pass: `${process.env.EMAIL_PASSWORD}`
    }
});

router.get('/user', (req, res) => {
    User.findById(req.query.token).then(user => {
        res.json(user);
    })
})

router.get('/user/verify', (req, res) => {
    User.findById(req.query.token).then(user => {
        if (user.verify_token === req.query.verify_token) {
            user.verified = true;
            user.save();
            res.json({ success: true })
        } else {
            res.json({ success: false })
        }
    })
})

router.post('/user/contacts', (req, res) => {
    User.findById(req.query.token).then(user => {
        user.contacts = req.body.contacts;
        user.save();
        res.json({ success: true })
    })
})

router.get('/user/dash', (req, res) => {
    User.findById(req.query.token).then(user => {
        res.json({
            name: user.name,
            rating: user.rating,
            location: user.location
        });
    })
})

router.post('/user/update', (req, res) => {
    User.findById(req.query.token).then(user => {
        user.online = true;
        user.location = req.body.location;
        user.save();
        res.json({ success: true })
    })
})

router.get('/user/socket', (req, res) => {
    try {
        User.findById(req.query.token).then(user => {
            user.socket_id = req.query.socket_id;
            user.save();
            res.json({ success: true })
        })
    } catch (err) {
        console.log(err);
    }
})

router.get('/user/start', async (req, res) => {
    const token = req.query.token;
    const destination = req.query.destination;
    const destination_name = req.query.destination_name;
    const user = await User.findById(token);
    const newStride = new Stride({
        start_location: user.location,
        end_location: destination,
        end_location_name: destination_name,
        stridee: {
            name: user.name,
            uid: user._id,
            rating: user.rating,
        },
        stridee_id: user._id,
    })
    newStride.save();
    res.json({ success: true, stride_id: newStride._id })
})

router.get('/user/stride', async (req, res) => {
    const strideID = req.query.stride_id;
    const stride = await Stride.findById(strideID);
    res.json(stride);
})

router.get('/user/strides', async (req, res) => {
    const token = req.query.token;
    const user = await User.findById(token);
    const strides = await Stride.find({ stridee_id: { $ne: user._id } });
    res.json(strides);
})

router.get('/user/accept-strider', async (req, res) => {
    const strideID = req.query.stride;
    const strider = req.query.strider;
    const striderUser = await User.findById(strider);
    const stride = await Stride.findById(strideID);
    stride.strider = {
        name: striderUser.name,
        uid: striderUser._id,
        rating: striderUser.rating,
    }
    stride.save();
    res.json({ success: true })
})

router.get('/user/request-stridee', async (req, res) => {
    const strideID = req.query.stride;
    const strideeID = req.query.token;
    const stridee = await User.findById(strideeID);
    const stride = await Stride.findById(strideID);
    stride.requests.push({
        name: stridee.name,
        uid: stridee._id,
        rating: stridee.rating,
        distance: Number(req.query.distance),
        duration: req.query.duration
    })
    stride.save();
    res.json({ success: true })
})

router.get('/user/stride/ongoing', async (req, res) => {
    const strideID = req.query.stride;
    const stride = await Stride.findById(strideID);
    const otherpersonID = req.query.otherperson;
    const otherperson = await User.findById(otherpersonID);
    stride.ongoing = true;
    stride.save();
    // mail trusted contacts with strider's info
    var mailOptions = {
        from: 'safestride413@gmail.com',
        to: `${otherperson.contacts[0].email}`,
        subject: 'SafeStride Information Email',
        html: `<p>Your friend ${stride.stridee.name} has asked SafeStride to share their stride infromation with you. They are on a trip to ${stride.end_location_name} with ${stride.strider.name}.</p>`
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
            res.json({ success: false, error: error })
        } else {
            res.json({ success: true })
        }
    });
})

router.get('/user/stride/end', async (req, res) => {
    const userID = req.query.token;
    const strideID = req.query.stride;
    const stride = await Stride.findById(strideID);
    let otherPersonID = ""
    if (stride.strider.uid === userID) {
        otherPersonID = stride.stridee.uid;
    } else {
        otherPersonID = stride.strider.uid;
    }
    stride.ongoing = false;
    stride.save();
    res.json({ success: true, otherperson: otherPersonID })
})

router.get('/user/review', async (req, res) => {
    const userID = req.query.reviewee;
    const user = await User.findById(userID);
    let rating = Number(req.query.rating);
    rating = Math.floor((user.rating + rating) / 2)
    user.rating = rating
    user.save();
    res.json({ success: true })
})

module.exports = router