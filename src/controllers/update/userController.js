const { default: mongoose } = require("mongoose");
const { CallPicpup } = require("../../models/callPickupProcess");
const { Restaurant } = require("../../models/restaurant.model");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { exotelWebhookSchema } = require("../../validation/userValidation");
const { updateStatusOfCallerUpdate } = require("../../sockets/emitter");

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

    const resturantDetail = await Restaurant.findById(callerDetail.resturant);
    if (!resturantDetail) {
        return next(new ApiError("resturant record not found.", 400));
    }

    const callDetail = await CallPicpup.aggregate([
        {
            $match: {
                resturant: new mongoose.Types.ObjectId(callerDetail.resturant),
                status: "in-progress"
            }
        },
        { $limit: 1 },
        {
            $lookup: {
                from: "profiles",
                localField: "userId",
                foreignField: "_id",
                as: "callerDetail",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullName: 1,
                            email: 1,
                            profileId: 1,
                            status: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                callerDetail: { $arrayElemAt: ["$callerDetail", 0] }
            }
        },
        {
            $project: {
                userId: 0,
                sidNumber: 0,
                createdAt: 0.

            }
        }
    ]);

    updateStatusOfCallerUpdate(resturantDetail.resturantOwner, callDetail[0])


    return res.status(200).json(
        new ApiResponse(200, {}, "Webhook updated successfully.")
    );
});

module.exports = { callToResturantForPlaceOrder, webhookUrlOfResturantOwnerPickupCall }