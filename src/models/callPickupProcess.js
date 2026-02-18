const mongoose = require("mongoose");

const callPickupSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        required: true,
        index: true,
    },
    sidNumber: {
        type: String,
        required: true,
        index: true,
    },
    resturant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ["pending", 'ringing', 'in-progress', 'completed', 'failed', 'notpickup'],
        default: "pending"
    }

}, { timestamps: true })


const CallPicpup = mongoose.model("CallPicpup", callPickupSchema);
module.exports = { CallPicpup }