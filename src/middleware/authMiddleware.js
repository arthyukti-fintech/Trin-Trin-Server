const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError");
const { Profile } = require("../models/profile.model");

const authMiddleware = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ApiError("Authorization token missing", 401));
    }
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await Profile.findById(decoded._id);
        if (!user) {
            return next(new ApiError("Profile not found", 403));
        }
        if (user.accessToken !== token) {
            return next(new ApiError("Session expired. Logged in from another device.", 401));
        }
        
        if (user.isActive === false && user.role === "user") {
            return next(
                new ApiError(
                    "Your account is disabled. Please contact the support team to reactivate it.",
                    401
                )
            );
        }

        req.userId = user._id;
        next();
    } catch (error) {
        return next(new ApiError("Invalid or expired token", 401));
    }
});

module.exports = { authMiddleware };