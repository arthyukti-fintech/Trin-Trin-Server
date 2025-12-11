const express = require("express");
const { loginProfile } = require("../controllers/profileController");

const authRouter = express.Router({
    caseSensitive: true,
    strict: true
});

authRouter.post("/login", loginProfile);

module.exports = { authRouter };