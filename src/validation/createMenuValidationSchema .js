const Joi = require("joi");

exports.createMenuValidationSchema = Joi.object({
    menuName: Joi.string()
        .min(2)
        .max(150)
        .trim()
        .required()
        .messages({
            "string.empty": "Menu name is required",
            'any.required': "Menu name is required",
            "string.min": "Menu name must be at least 2 characters",
            "string.max": "Menu name must not exceed 150 characters",
        }),

    description: Joi.string()
        .max(1000)
        .allow("", null)
        .messages({
            "string.max": "Description must not exceed 1000 characters",
        }),

    price: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
            "number.base": "Price must be a number",
            "number.positive": "Price must be greater than 0",
        }),

    isVeg: Joi.boolean().default(true),

    category: Joi.string()
        .optional()
        .default("Other"),

    maxMenuItems: Joi.number()
        .integer()
        .min(1)
        .allow(null),
});