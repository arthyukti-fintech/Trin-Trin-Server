const { default: mongoose } = require("mongoose");
const { CallPicpup } = require("../../models/callPickupProcess");
const { Restaurant } = require("../../models/restaurant.model");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { exotelWebhookSchema } = require("../../validation/userValidation");

const callToResturantForPlaceOrder = asyncHandler(async (req, res, next) => {
    const sidNumber = Math.random() * 1000000;
    const userId = req.userId;
    const { ResturantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ResturantId)) {
        return next(new ApiError("Invalid account ID.", 400));
    }

    const restuarnt = await Restaurant.findById(ResturantId);
    if (!restuarnt) {
        return next(new ApiError("Restaurant not found."))
    }

    const callPickSave = await CallPicpup.create({
        userId,
        sidNumber,
        resturant: ResturantId,
    })

    return res.status(201).json(new ApiResponse(201, callPickSave))

})

const webhookUrlOfResturantOwnerPickupCall = asyncHandler(async (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ApiError("Request body cannot be empty.", 400));
    }

    const { error, value } = exotelWebhookSchema.validate(req.body);

    if (error) {
        return next(new ApiError(error.details[0].message, 400));
    }

    const { CallSid, CallStatus } = value;

    const callerDetail = await CallPicpup.findOneAndUpdate(
        { sidNumber: CallSid },
        { status: CallStatus },
        { new: true }
    );

    if (!callerDetail) {
        return next(new ApiError("Call record not found.", 400));
    }

    return res.status(200).json(
        new ApiResponse(200, callerDetail, "Webhook updated successfully.")
    );
});

module.exports = { callToResturantForPlaceOrder, webhookUrlOfResturantOwnerPickupCall }