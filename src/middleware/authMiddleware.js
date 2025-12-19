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
            return next(new ApiError("Profile not found", 401));
        }

        const sessionExists = user.sessions?.some(
            session => session.token === token
        );

        if (!sessionExists) {
            return next(
                new ApiError("Session expired. Please login again.", 401)
            );
        }

        if (user.isActive === false) {
            return next(
                new ApiError("Account disabled. Contact support.", 403)
            );
        }

        req.userId = user._id;
        req.user = user;
        next();
    } catch (err) {
        return next(new ApiError("Invalid or expired token", 401));
    }
});

module.exports = { authMiddleware };