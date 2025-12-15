const express = require("express");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const { loginAdminUser, updateProfileStatus } = require("../controllers/update/adminController");
const { readProfile, getAllProfiles, getProfileById } = require("../controllers/read/adminController");


const adminRouter = express.Router({
    caseSensitive: true,
    strict: true
});

adminRouter.post("/auth/login", loginAdminUser);
adminRouter.get("/read/profile", adminMiddleware, readProfile);
adminRouter.get("/profile", adminMiddleware, getAllProfiles);
adminRouter.get("/profile/:id", adminMiddleware, getProfileById);
adminRouter.patch("/profile/:id/status", adminMiddleware, updateProfileStatus);

module.exports = { adminRouter };