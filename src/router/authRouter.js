const express = require("express");
const { loginProfile, sendOpt } = require("../controllers/profileController");
const { verifyFirebaseToken } = require("../middleware/fireBaseMiddleware");

const authRouter = express.Router({
    caseSensitive: true,
    strict: true
});

authRouter.post("/login", loginProfile);

module.exports = { authRouter };