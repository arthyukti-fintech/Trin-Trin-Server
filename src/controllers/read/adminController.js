const { default: mongoose } = require("mongoose");
const { Profile } = require("../../models/profile.model");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const readProfile = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const profile = await Profile.findById(userId).select("-sessions -password -activityLog -ip -userAgent -os -accessToken ")

    return res.status(200).json(
        new ApiResponse(200, profile)
    );
})

const getProfileById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError("Invalid account ID.", 400));
    }
    const profile = await Profile.findById(id);

    if (!profile) {
        return next(new ApiError("Profile not found", 404));
    }

    return res.status(200).json(
        new ApiResponse(200, profile)
    );
});

const getAllProfiles = asyncHandler(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
        Profile.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Profile.countDocuments(),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            total,
            page,
            limit,
            profiles,
        })
    );
});






module.exports = { readProfile, getProfileById, getAllProfiles }