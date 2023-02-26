const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    start_location: {
        type: Array,
        required: true
    },
    end_location_name: {
        type: String,
        required: true
    },
    end_location: {
        type: Array,
        required: true
    },
    stridee: {
        type: Object,
        required: false,
        default: {
            name: "",
            uid: "",
            rating: 0,
        }
    },
    stridee_id: {
        type: String,
        required: true
    },
    strider: {
        type: Object,
        required: false,
        default: {
            name: "",
            uid: "",
            rating: 0,
        }
    },
    requests: {
        type: Array,
        required: false,
        default: []
    },
    ongoing: {
        type: Boolean,
        required: true,
        default: false
    },
    otp_token: {
        type: String,
        required: false,
        default: Math.floor(1000 + Math.random() * 9000)
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Activity = mongoose.model('Activity', ActivitySchema);

module.exports = Activity;