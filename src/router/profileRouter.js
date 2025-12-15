const express = require("express");

const {
    getMyProfile,
    getProfileById,
    getAllProfiles,
    updateProfileStatus,
} = require("../controllers/profileController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");

const profileRouter = express.Router();

/* ================= AUTHENTICATED ================= */

profileRouter.get(
    "/profile/me",
    authMiddleware,
    getMyProfile
);

/* ================= ADMIN ONLY ================= */

profileRouter.get(
    "/profile",
    adminMiddleware,
    getAllProfiles
);

profileRouter.get(
    "/profile/:id",
    adminMiddleware,
    getProfileById
);

profileRouter.patch(
    "/profile/:id/status",
    adminMiddleware,
    updateProfileStatus
);

module.exports = { profileRouter };
