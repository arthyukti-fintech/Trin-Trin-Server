const { default: mongoose } = require("mongoose");
const { ApiError } = require("../../utils/apiError");
const { asyncHandler } = require("../../utils/asyncHandler");
const { Restaurant } = require("../../models/restaurant.model");
const { CallPicpup } = require("../../models/callPickupProcess");
const { ApiResponse } = require("../../utils/apiResponse");

const getCallProgessDetail = asyncHandler(async (req, res, next) => {

    const userId = req.userId;
    const role = req.role;
    const { ResturantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ResturantId)) {
        return next(new ApiError("Invalid ResturantId ID.", 400));
    }

    if (role === "resturantsOwner") {
        const restaurant = await Restaurant.findOne({ resturantOwner: userId, _id: ResturantId });
        if (!restaurant) {
            return next(new ApiError("Restaurant not found with connecting call", 404));
        }
    } else if (role !== "admin" && role !== "superAdmin") {
        return next(
            new ApiError(
                "Unauthorized access. Access allowed only to Admin or RestaurantOwner",
                403
            )
        );
    }

    // const callDetail = await CallPicpup.findOne({ resturant: ResturantId, status: "in-progress" });
    const callDetail = await CallPicpup.aggregate([
        {
            $match: {
                resturant: new mongoose.Types.ObjectId(ResturantId),
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


    return res.status(200).json(new ApiResponse(200, callDetail[0]))


})

module.exports = { getCallProgessDetail }