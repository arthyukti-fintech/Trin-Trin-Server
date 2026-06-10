const express = require("express");
const { loginProfile, sendOpt, logoutProfile } = require("../controllers/profileController");
const { verifyFirebaseToken } = require("../middleware/fireBaseMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");

const authRouter = express.Router({
    caseSensitive: true,
    strict: true
});

authRouter.post("/login", loginProfile);
authRouter.post("/logout",authMiddleware, logoutProfile);

module.exports = { authRouter };