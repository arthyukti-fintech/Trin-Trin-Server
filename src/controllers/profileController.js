const { default: mongoose } = require("mongoose");
const { Profile } = require("../models/profile.model");
const { ApiError } = require("../utils/apiError");
const { ApiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { profileSchema } = require("../validation/profileValidation");


const loginProfile = asyncHandler(async (req, res, next) => {
    // const user = req.user;

    // if (!user) {
    //     return next(new ApiError("You are not authorized to access this platform.", 401));
    // }

    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ApiError("Request body cannot be empty.", 400));
    }

    const { error } = profileSchema.validate(req.body);
    if (error) {
        console.log(error)
        return next(new ApiError(error.details[0].message, 400));
    }
    const { phoneNumber, expoToken } = req.body;

    // if (phoneNumber !== user.phoneNumber) {
    //     return next(new ApiError("Your credentials do not match.", 401));
    // }


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
    const userId = req.userId; 
    const profile = await Profile.findById(userId).select("-sessions -activityLog -ip -userAgent -os -accessToken ")

    return res.status(200).json(
        new ApiResponse(200, profile)
    );
});


module.exports = {
    loginProfile,
     getMyProfile,

}