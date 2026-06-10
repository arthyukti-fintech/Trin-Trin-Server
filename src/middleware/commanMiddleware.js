const { ApiError } = require("../utils/apiError");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/asyncHandler");
const { Profile } = require("../models/profile.model");

const commanMiddleware = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ApiError("Authorization token missing", 401));
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await Profile.findById(decoded._id);

        if (!user) {
            return next(new ApiError("Profile not found", 401));
        }

        if (user.isActive === false) {
            return next(
                new ApiError("Account disabled. Contact support.", 403)
            );
        }

        req.userId = user._id;
        req.role = user.role;
        next();
    } catch (error) {
        console.log(error)
        return next(new ApiError("Invalid or expired token", 401));
    }

})

module.exports = { commanMiddleware }