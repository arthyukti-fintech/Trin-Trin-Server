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

exports.createResturantOwnerValidationScheme = Joi.object({
    phoneNumber: Joi.string()
        .pattern(/^\+91/)
        .length(13)
        .required()
        .messages({
            'string.empty': 'Phone number is required.',
            'string.pattern.base': 'Phone number must be in the format +91XXXXXXXXXX',
            'string.length': 'Phone number must be exactly 13 characters long with +91.',
            'any.required': 'Phone number is required',
        }),
    fullName: Joi.string()
        .required()
        .messages({
            'string.empty': 'User name is required',
            'any.required': 'User name is required',
        }),
    password: Joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .required()
        .messages({
            'string.empty': 'Password is required.',
            'string.pattern.base':
                'Password must meet all of the following:\n' +
                '- At least 8 characters long\n' +
                '- At least one uppercase letter (A-Z)\n' +
                '- At least one lowercase letter (a-z)\n' +
                '- At least one number (0-9)\n' +
                '- At least one special character (@$!%*?&)',
            'any.required': 'Password is required.',
        }),
    dob: Joi.date()
        .iso()
        .less('now')
        .optional()
        .messages({
            'date.base': 'Date of birth must be a valid date',
            'date.format': 'Date of birth must be in ISO format (YYYY-MM-DD)',
            'date.less': 'Date of birth must be in the past',
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.email": "Please enter a valid email address.",
            "string.empty": "Email is required.",
            "any.required": "Email is required.",
        })
});

exports.orderValidationSchema = Joi.object({
    userId: Joi.string()
        .trim()
        .required()
        .messages({
            "string.base": "User ID must be a string",
            "string.empty": "User ID is required",
            "any.required": "User ID is required"
        }),

    timeSlot: Joi.date()
        .optional()
        .messages({
            "date.base": "Time slot must be a valid date"
        }),

    items: Joi.array()
        .items(
            Joi.object({
                itemId: Joi.string()
                    .required()
                    .messages({
                        "string.base": "Item ID must be a string",
                        "string.empty": "Item ID is required",
                        "any.required": "Item ID is required"
                    }),

                quantity: Joi.number()
                    .integer()
                    .min(1)
                    .required()
                    .messages({
                        "number.base": "Quantity must be a number",
                        "number.integer": "Quantity must be an integer",
                        "number.min": "Quantity must be at least 1",
                        "any.required": "Quantity is required"
                    }),
                price: Joi.number()
                    .integer()
                    .min(0)
                    .required()
                    .messages({
                        "number.base": "Price must be a number",
                        "number.integer": "Price must be an integer",
                        "number.min": "Price must be at least 1",
                        "any.required": "Price is required"
                    }),

                itemName: Joi.string()
                    .trim()
                    .required()
                    .messages({
                        "string.base": "Item name must be a string",
                        "string.empty": "Item name is required",
                        "any.required": "Item name is required"
                    })
            })
        )
        .min(1)
        .required()
        .messages({
            "array.base": "Items must be an array",
            "array.min": "At least one item is required",
            "any.required": "Items are required"
        })
});