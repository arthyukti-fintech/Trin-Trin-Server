const express = require("express");

const { verifyFirebaseToken } = require("../middleware/fireBaseMiddleware");
const { loadProfile } = require("../middleware/loadProfile");
const { allowRoles } = require("../middleware/roleGuard");

const {
    getMyProfile,
    getProfileById,
    getAllProfiles,
    updateProfileStatus,
    getPublicProfile,
} = require("../controllers/profileController");

const profileRouter = express.Router();

/* ================= AUTHENTICATED ================= */

profileRouter.get(
    "/profile/me",
    verifyFirebaseToken,
    loadProfile,
    getMyProfile
);

/* ================= ADMIN ONLY ================= */

profileRouter.get(
    "/profile",
    // verifyFirebaseToken,
    loadProfile,
    allowRoles("admin"),
    getAllProfiles
);

profileRouter.get(
    "/profile/:id",
    verifyFirebaseToken,
    loadProfile,
    allowRoles("admin"),
    getProfileById
);

profileRouter.patch(
    "/profile/:id/status",
    verifyFirebaseToken,
    loadProfile,
    allowRoles("admin"),
    updateProfileStatus
);

/* ================= PUBLIC ================= */

profileRouter.get(
    "/profile/public/:profileId",
    getPublicProfile
);

module.exports = { profileRouter };
