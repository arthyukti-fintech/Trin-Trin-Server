const express = require("express");
const { loginProfile } = require("../controllers/profileController");
const { verifyFirebaseToken } = require("../middleware/fireBaseMiddleware");

const authRouter = express.Router({
    caseSensitive: true,
    strict: true
});

authRouter.post("/login", verifyFirebaseToken, loginProfile);

module.exports = { authRouter };