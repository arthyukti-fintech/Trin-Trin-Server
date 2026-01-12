const { Profile } = require("../../models/profile.model");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { createResturantOwnerValidationScheme } = require("../../validation/restaurantValidation");

const createRestaurantOwnerAccount = asyncHandler(async (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ApiError("Request body cannot be empty.", 400));
    }
    const { error } = createResturantOwnerValidationScheme.validate(req.body);
    if (error) {
        console.log(error)
        return next(new ApiError(error.details[0].message, 400));
    }

    const { phoneNumber, fullName, dob, email, password } = req.body;
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ip = req.ip || req.connection.remoteAddress;
    const ipv4 = ip.replace('::ffff:', '');
    const os = req.useragent?.os || "Unknown";

    const existingProfile = await Profile.findOne({ $or: [{ email, phoneNumber }] });

    if (existingProfile) {
        return next(
            new ApiError(
                "Account already exists with this email or phone number",
                409
            )
        );
    }

    const profile = await Profile.create({
        ip,
        userAgent,
        os,
        phoneNumber,
        fullName,
        email,
        role: "resturantsOwner",
        password,
        dob,
    });

    const accessToken = await profile.generateAccessToken();
    profile.sessions.push({ token: accessToken });
    if (profile.sessions.length > 30) {
        profile.sessions = profile.sessions.slice(-30);
    }
    profile.accessToken = accessToken;
    await profile.save({ validateBeforeSave: false });
    return res
        .status(201)
        .json(new ApiResponse(201, { accessToken }, "Your restaurant owner account has been created successfully and is pending administrative approval."));
})






module.exports = { createRestaurantOwnerAccount }