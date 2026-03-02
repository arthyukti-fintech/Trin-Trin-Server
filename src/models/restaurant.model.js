const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        cuisine: { type: String, required: true },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String },
        },
        resturantOwner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
        phoneNumber: { type: String, required: true },
        images: {
            exterior: { type: String },
            interior: { type: String },
            menuCard: { type: String },
        },
        averageDeliveryTime: { type: String, default: "30-40 min" },
        priceForTwo: { type: Number },
        offers: {
            discountText: { type: String, default: "" },
            percentage: { type: Number, default: 0 },
        },
        location: {
            lat: { type: Number },
            lng: { type: Number },
        },
        isVegOnly: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        ratings: {
            average: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            },
            count: {
                type: Number,
                default: 0
            },
            breakdown: {
                oneStar: { type: Number, default: 0 },
                twoStar: { type: Number, default: 0 },
                threeStar: { type: Number, default: 0 },
                fourStar: { type: Number, default: 0 },
                fiveStar: { type: Number, default: 0 }
            }
        },
        freeDelivery: { type: Boolean, default: false },
        freeDeliveryDistance: { type: Number, default: "0" },
        cloudKitchen: {
            type: Boolean, default: false
        }
    },
    { timestamps: true }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = { Restaurant };