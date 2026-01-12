const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: String,
    timeSlot: Date,
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    items: [
        {
            item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
            quantity: Number,
            itemName: String
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'failed'],
        default: 'pending'
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = { Order }