const { default: mongoose } = require("mongoose");
const { Profile } = require("../../models/profile.model");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { adminLoginSchema } = require("../../validation/adminValidation");

const loginAdminUser = asyncHandler(async (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ApiError("Empty request body", 400));
    }

    const { error } = adminLoginSchema.validate(req.body);
    if (error) return next(new ApiError(error.details[0].message, 400));

    const { phoneNumber, password } = req.body;

    const existProfile = await Profile.findOne({ phoneNumber });
    if (!existProfile) return next(new ApiError("Profile does not exist.", 400));

    const isPasswordValid = await existProfile.isCorrectPassword(password);
    if (!isPasswordValid) return next(new ApiError("Invalid Password", 400));

    const newToken = await existProfile.generateAccessToken();

    if (existProfile.role !== "user") {
        existProfile.sessions.push({ token: newToken });

        if (existProfile.sessions.length > 30) {
            existProfile.sessions = existProfile.sessions.slice(-30);
        }
    }
    await existProfile.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, { accessToken: newToken }, "Login successful"));
});

const updateProfileStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError("Invalid account ID.", 400));
    }
    const { status, isActive } = req.body;
    const profile = await Profile.findById(id);

    if (!profile) {
        return next(new ApiError("Profile not found", 404));
    }

    if (status) profile.status = status;
    if (typeof isActive === "boolean") profile.isActive = isActive;

    await profile.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, profile, "Profile status updated")
    );
});

module.exports = {
    loginAdminUser,
    updateProfileStatus
};