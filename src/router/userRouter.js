const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { callToResturantForPlaceOrder, webhookUrlOfResturantOwnerPickupCall } = require("../controllers/update/userController");
const { getCallProgessDetail } = require("../controllers/read/userController");
const { commanMiddleware } = require("../middleware/commanMiddleware");


const userRouter = express.Router({
    caseSensitive: true,
    strict: true
});

userRouter.post("/v1/call-exotel/:ResturantId", authMiddleware, callToResturantForPlaceOrder)
userRouter.get("/read/v1/call-details/:ResturantId", commanMiddleware, getCallProgessDetail)
userRouter.post("/update/excotel/call-details/webhook", webhookUrlOfResturantOwnerPickupCall)


module.exports = { userRouter };