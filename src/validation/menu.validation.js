const Joi = require("joi");

const menuCreateSchema = Joi.object({
    restaurantId: Joi.string().required(),
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().allow(""),
    price: Joi.number().positive().required(),
    isVeg: Joi.boolean(),
    category: Joi.string().allow(""),
    image: Joi.string().uri().allow(""),
    isAvailable: Joi.boolean(),
});

module.exports = { menuCreateSchema };
