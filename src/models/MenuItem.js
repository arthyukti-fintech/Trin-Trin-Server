const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: String,
    price: Number,
    stock: Number,
    available: { type: Boolean, default: true },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
}, { timestamps: true });

menuItemSchema.index({ restaurant: 1 });
const MenuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = { MenuItem }