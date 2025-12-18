const { Profile } = require("../../models/profile.model");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { adminAccountSchema } = require("../../validation/adminValidation");

const createAdminAccount = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    if (!userId) {
        return next(new ApiError("Unauthorized access. Please login first.", 401));
    }

    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ApiError("Request body cannot be empty.", 400));
    }

    const { error } = adminAccountSchema.validate(req.body);
    if (error) {
        return next(new ApiError(error.details[0].message, 400));
    }

    const { phoneNumber, password, fullName, email } = req.body;

    const userAgent = req.headers["user-agent"] || "Unknown";
    const ip = req.ip || req.connection?.remoteAddress || "Unknown";
    const os = req.useragent?.os || "Unknown";

    const existingProfile = await Profile.findOne({ phoneNumber });

    if (existingProfile) {
        if (existingProfile.role !== "user") {
            return next(
                new ApiError(
                    "This phone number is already registered with another admin account. Please use a different number.",
                    400
                )
            );
        }
    }

    let profile;

    if (existingProfile && existingProfile.role === "user") {
        profile = await Profile.findOneAndUpdate(
            { phoneNumber },
            {
                $set: {
                    ip,
                    userAgent,
                    os,
                    fullName,
                    email,
                    emailVerification: true,
                    role: "admin",
                    password,
                    updatedAt: new Date(),
                },
            },
            { new: true }
        );
    } else {
        profile = await Profile.create({
            ip,
            userAgent,
            os,
            phoneNumber,
            fullName,
            email,
            emailVerification: true,
            role: "admin",
            password,
        });
    }

    const accessToken = await profile.generateAccessToken();


    if (profile.role !== "user") {
        profile.sessions.push({ token: accessToken });

        if (profile.sessions.length > 30) {
            profile.sessions = profile.sessions.slice(-30);
        }
    }

    profile.accessToken = accessToken;
    await profile.save({ validateBeforeSave: false });

    return res
        .status(201)
        .json(new ApiResponse(201, { accessToken }, "Admin account created successfully."));
});



module.exports = { createAdminAccount }