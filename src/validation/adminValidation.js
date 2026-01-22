const Joi = require('joi');

exports.adminLoginSchema = Joi.object({
    medium: Joi.string()
        .required()
        .custom((value, helpers) => {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            const isPhone = /^\+91\d{10}$/.test(value);

            if (!isEmail && !isPhone) {
                return helpers.message(
                    'Please enter a valid email or phone number (+91XXXXXXXXXX)'
                );
            }
            return value;
        })
        .messages({
            'string.empty': 'Email or phone number is required.',
            'any.required': 'Email or phone number is required.',
        }),

    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Password is required.',
            'any.required': 'Password is required.',
        }),
});


exports.adminAccountSchema = Joi.object({

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
    fullName: Joi.string()
        .required()
        .messages({
            'string.empty': 'User name is required',
            'any.required': 'User name is required',
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