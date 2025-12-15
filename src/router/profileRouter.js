const express = require("express");

const {
    getMyProfile,
} = require("../controllers/profileController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");

const profileRouter = express.Router();

profileRouter.get(
    "/profile/me",
    authMiddleware,
    getMyProfile
);


module.exports = { profileRouter };
