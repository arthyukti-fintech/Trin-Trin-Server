const Joi = require("joi");

exports.restaurantCreateSchema = Joi.object({
    name: Joi.string().required(),
    cuisine: Joi.string().required(),

    phoneNumber: Joi.string().required(),

    address: Joi.object({
        street: Joi.string().allow(""),
        city: Joi.string().allow(""),
        state: Joi.string().allow(""),
        pincode: Joi.string().allow(""),
    }),

    images: Joi.object({
        exterior: Joi.string().allow(""),
        interior: Joi.string().allow(""),
        menuCard: Joi.string().allow(""),
    }),

    averageDeliveryTime: Joi.string().allow(""),
    priceForTwo: Joi.number().allow(null),

    offers: Joi.object({
        discountText: Joi.string().allow(""),
        percentage: Joi.number().min(0).max(100).allow(null),
    }),

    location: Joi.object({
        lat: Joi.number().allow(null),
        lng: Joi.number().allow(null),
    }),

    isVegOnly: Joi.boolean(),
});
