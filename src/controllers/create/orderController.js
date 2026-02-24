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


    const { items, timeSlot, resturantId, deliveryAddress, specialInstructions, paymentMethod = "upi" } = req.body;

    if (!req.body.userId || !Array.isArray(items) || items.length === 0) {
        return next(new ApiError("Invalid order format.", 400));
    }
    const restaurant = await Restaurant.findById(resturantId)
    if (!restaurant) {
        return next(new ApiError("Resturant not found.", 400))
    }
    const job = await orderQueue.add("new-order", {
        userId: req.body.userId,
        restaurantId: resturantId,
        resturantUserId: userId,
        items,
        deliveryAddress,
        specialInstructions: specialInstructions || "",
        paymentMethod,
        estimatedPreparationTime :restaurant.averageDeliveryTime,
        timeSlot: timeSlot || new Date(),
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { jobId: job.id }, "Order queued for processing"));
})

module.exports = { queueOrderOfMenuItems }