const Joi = require('joi');

exports.profileSchema = Joi.object({
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
    expoToken: Joi.string()
        .allow(null, '')
        .messages({
            'string.empty': 'Expo push token cannot be empty string.',
        }),
});

exports.profileUpdateSchema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    gender: Joi.string().valid("male", "female", "other").optional(),
    email: Joi.string().email().optional(),
});