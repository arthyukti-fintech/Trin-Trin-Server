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
    },
    { timestamps: true }
);

// restaurantSchema.index({ name: 1, cuisine: 1, "address.city": 1 })

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = { Restaurant };