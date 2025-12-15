const Joi = require("joi");

exports.restaurantCreateSchema = Joi.object({
    name: Joi.string()
        .required()
        .messages({
            "string.empty": "Restaurant name cannot be empty.",
            "any.required": "Restaurant name is required.",
            "string.base": "Restaurant name must be a valid string.",
        }),

    cuisine: Joi.string()
        .required()
        .messages({
            "string.empty": "Cuisine type is required.",
            "any.required": "Cuisine field cannot be left blank.",
            "string.base": "Cuisine must be a valid string.",
        }),

    phoneNumber: Joi.string()
        .trim()
        .pattern(/^\d{10}$/)
        .required()
        .messages({
            "string.empty": "Phone number is required.",
            "any.required": "Phone number cannot be empty.",
            "string.pattern.base": "Phone number must be a 10-digit number.",
            "string.base": "Phone number must be a valid string.",
        }),

    address: Joi.object({
        street: Joi.string().allow("").messages({
            "string.base": "Street must be a valid string."
        }),
        city: Joi.string().allow("").messages({
            "string.base": "City must be a valid string."
        }),
        state: Joi.string().allow("").messages({
            "string.base": "State must be a valid string."
        }),
        pincode: Joi.string()
            .pattern(/^\d{5,6}$/)
            .allow("")
            .messages({
                "string.pattern.base": "Pincode must be 5 or 6 digits.",
                "string.base": "Pincode must be a valid string.",
            }),
    }).messages({
        "object.base": "Address must be a valid object."
    }),

    images: Joi.object({
        exterior: Joi.string().uri().allow("").messages({
            "string.uri": "Exterior image must be a valid URL string.",
        }),
        interior: Joi.string().uri().allow("").messages({
            "string.uri": "Interior image must be a valid URL string.",
        }),
        menuCard: Joi.string().uri().allow("").messages({
            "string.uri": "Menu card image must be a valid URL string.",
        }),
    }).messages({
        "object.base": "Images must be a valid object.",
    }),

    averageDeliveryTime: Joi.string().allow("").messages({
        "string.base": "Average delivery time must be a valid string."
    }),

    priceForTwo: Joi.number().allow(null).messages({
        "number.base": "Price for two must be a valid number.",
    }),

    offers: Joi.object({
        discountText: Joi.string().allow("").messages({
            "string.base": "Discount text must be a valid string.",
        }),
        percentage: Joi.number()
            .min(0)
            .max(100)
            .allow(null)
            .messages({
                "number.base": "Discount percentage must be a valid number.",
                "number.min": "Discount must be at least 0%.",
                "number.max": "Discount cannot exceed 100%.",
            }),
    }).messages({
        "object.base": "Offers must be a valid object.",
    }),

    location: Joi.object({
        lat: Joi.number()
            .min(-90)
            .max(90)
            .allow(null)
            .messages({
                "number.base": "Latitude must be a valid number.",
                "number.min": "Latitude cannot be less than -90.",
                "number.max": "Latitude cannot be more than 90.",
            }),
        lng: Joi.number()
            .min(-180)
            .max(180)
            .allow(null)
            .messages({
                "number.base": "Longitude must be a valid number.",
                "number.min": "Longitude cannot be less than -180.",
                "number.max": "Longitude cannot be more than 180.",
            }),
    }).messages({
        "object.base": "Location must be a valid object with lat and lng.",
    }),

    isVegOnly: Joi.boolean().messages({
        "boolean.base": "isVegOnly must be a boolean value (true or false)."
    }),
});