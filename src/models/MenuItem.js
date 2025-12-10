const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: String,
    price: Number,
    stock: Number,
    available: { type: Boolean, default: true },
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = { MenuItem }