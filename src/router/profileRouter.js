const express = require("express");

const {
    getMyProfile,
    updateMyProfile,
} = require("../controllers/profileController");
const { authMiddleware } = require("../middleware/authMiddleware");

const profileRouter = express.Router();

profileRouter.get(
    "/profile/me",
    authMiddleware,
    getMyProfile
);

profileRouter.patch(
    "/profile/me",
    authMiddleware,
    updateMyProfile
);

module.exports = { profileRouter };
