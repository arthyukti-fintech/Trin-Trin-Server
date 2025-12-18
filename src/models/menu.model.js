const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
    {
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        isVeg: {
            type: Boolean,
            default: true,
        },

        category: {
            type: String, // Starter, Main Course, Dessert, etc.
            trim: true,
        },

        image: {
            type: String, // URL
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports.Menu = mongoose.model("Menu", menuSchema);
