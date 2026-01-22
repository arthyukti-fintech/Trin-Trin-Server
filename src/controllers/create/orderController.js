const { Restaurant } = require("../../models/restaurant.model");
const orderQueue = require("../../queues/order.queue");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { orderValidationSchema } = require("../../validation/restaurantValidation");

const queueOrderOfMenuItems = asyncHandler(async (req, res, next) => {
    const userId = req.userId
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ApiError("Request body cannot be empty.", 400));
    }

    const { error } = orderValidationSchema.validate(req.body);
    if (error) {
        console.log(error)
        return next(new ApiError(error.details[0].message, 400));
    }


    const { items, timeSlot } = req.body;

    if (!req.body.userId || !Array.isArray(items) || items.length === 0) {
        return next(new ApiError("Invalid order format.", 400));
    }
    const restaurant = await Restaurant.findOne({ resturantOwner: userId })
    const job = await orderQueue.add("new-order", {
        userId: req.body.userId,
        restaurantId: restaurant._id,
        resturantUserId: userId,
        items,
        timeSlot: timeSlot || new Date(),
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { jobId: job.id }, "Order queued for processing"));
})

module.exports = { queueOrderOfMenuItems }