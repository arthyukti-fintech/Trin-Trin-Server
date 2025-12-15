const { Profile } = require("../models/profile.model");
const { ApiError } = require("../utils/apiError");
const { ApiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { profileSchema } = require("../validation/profileValidation");

const loginProfile = asyncHandler(async (req, res, next) => {
    const user = req.user;

    if (!user) {
        return next(new ApiError("You are not authorized to access this platform.", 401));
    }
    const { error } = profileSchema.validate(req.body);
    if (error) {
        console.log(error)
        return next(new ApiError(error.details[0].message, 400));
    }
    const { phoneNumber, expoToken } = req.body;

    if (phoneNumber !== user.phoneNumber) {
        return next(new ApiError("Your credentials do not match.", 401));
    }

    const userAgent = req.headers["user-agent"] || "Unknown";
    const ip = req.ip || req.connection.remoteAddress;
    const ipv4 = ip.replace('::ffff:', '');
    const os = req.useragent?.os || "Unknown";

    let profile = await Profile.findOne({ phoneNumber });

    if (!profile) {
        profile = new Profile({ phoneNumber });
    }
    profile.ip = ipv4;
    profile.userAgent = userAgent;
    profile.os = os;
    profile.expoToken = expoToken
    const newToken = await profile.generateAccessToken();
    profile.accessToken = newToken;

    await profile.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, { accessToken: newToken })
    );

});

const getMyProfile = asyncHandler(async (req, res, next) => {
    const profile = req.profile; // injected by loadProfile middleware

    return res.status(200).json(
        new ApiResponse(200, {
            profileId: profile.profileId,
            phoneNumber: profile.phoneNumber,
            role: profile.role,
            status: profile.status,
            isActive: profile.isActive,
            gender: profile.gender,
            referredCount: profile.referredCount,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        })
    );
});

const getProfileById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

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

const updateProfileStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
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

const getPublicProfile = asyncHandler(async (req, res, next) => {
    const { profileId } = req.params;

    const profile = await Profile.findOne({
        profileId,
        isActive: true,
    }).select("profileId role createdAt");

    if (!profile) {
        return next(new ApiError("Profile not found", 404));
    }

    return res.status(200).json(
        new ApiResponse(200, profile)
    );
});

module.exports = {
    loginProfile, getMyProfile,
    getProfileById,
    getAllProfiles,
    updateProfileStatus,
    getPublicProfile,
}