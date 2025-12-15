const { Profile } = require("../models/profile.model");
const { ApiError } = require("../utils/apiError");

const loadProfile = async (req, res, next) => {
    try {
        const profile = await Profile.findOne({
            phoneNumber: req.user.phoneNumber,
        });

        if (!profile) {
            return next(new ApiError("Profile not found", 404));
        }

        req.profile = profile;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { loadProfile };
