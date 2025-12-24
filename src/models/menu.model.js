
const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
    {
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true,
            index: true,
        },
        menuName: {
            type: String,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        price: {
            type: Number,
            min: 0,
        },
        isVeg: {
            type: Boolean,
            default: true,
        },
        category: {
            type: String,
            trim: true,
            default: "Other",
        },
        image: [
            {
                imageUrl:
                {
                    type: String,
                    trim: true,
                },
                hash: { type: String, unique: true },
            }
        ],
        maxMenuItems: {
            type: Number,
            default: null,
            min: 1,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)
menuSchema.index({ restaurant: 1 });

const Menu = mongoose.model("Menu", menuSchema);

module.exports = { Menu };