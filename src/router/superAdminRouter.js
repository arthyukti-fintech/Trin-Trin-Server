const express = require("express");
const { createAdminAccount } = require("../controllers/create/superAdminController");
const { superAdminMiddleware } = require("../middleware/superAdminMiddleware");


const superAdminRouter = express.Router({
    caseSensitive: true,
    strict: true
});

superAdminRouter.post("/create/admin-account", superAdminMiddleware, createAdminAccount)

if (process.env.NODE_ENV === "development") {   //change according to requiremnt but comment out before before code on github 
    try {
        const { createSuperAdminAccount } = require("../scripts/superAdmin");
        const { get2FAQr } = require("../scripts/MFACode")
        superAdminRouter.post('/2fa/setup', get2FAQr)
        superAdminRouter.post("/auth-super-admin/create-account", createSuperAdminAccount)
    } catch (err) {
        console.warn("⚠️ Super admin script not found. Skipping route.");
    }
}

module.exports = { superAdminRouter }