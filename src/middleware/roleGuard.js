const { ApiError } = require("../utils/apiError");

const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.profile || !roles.includes(req.profile.role)) {
            return next(new ApiError("Access denied", 403));
        }
        next();
    };
};

module.exports = { allowRoles };
