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
    // Basic info
    fullName: Joi.string().min(2).max(50).optional(),
    gender: Joi.string().valid("male", "female", "others").allow(null).optional(),
    email: Joi.string().email().lowercase().optional(),
    phoneNumber: Joi.string().optional(), // optional if you allow editing

    // Status / flags (user-level only)
    emailVerification: Joi.boolean().optional(),
    status: Joi.string().valid("normal", "premium").optional(),

    // Referral related (if user-facing)
    referredCount: Joi.number().integer().min(0).optional(),
    referredBy: Joi.string().allow(null).optional(),
    usedReferralCode: Joi.boolean().optional(),

    // Any extra profile fields you may have
    dob: Joi.date().optional(),
    profileImage: Joi.string().uri().optional(),
    address: Joi.object({
        street: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        pincode: Joi.string().optional(),
    }).optional(),

}).min(1).unknown(false);


