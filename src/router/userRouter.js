const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { callToResturantForPlaceOrder, webhookUrlOfResturantOwnerPickupCall } = require("../controllers/update/userController");
const { getCallProgessDetail, getMyAllOrderInProgress, getAllMyOrder, getSingleOrderDetails } = require("../controllers/read/userController");
const { commanMiddleware } = require("../middleware/commanMiddleware");
const { cancelOrderByRequest } = require("../controllers/create/userController");


const userRouter = express.Router({
    caseSensitive: true,
    strict: true
});

userRouter.post("/v1/call-exotel/:ResturantId", authMiddleware, callToResturantForPlaceOrder)
userRouter.get("/read/v1/call-details/:ResturantId", commanMiddleware, getCallProgessDetail)
userRouter.post("/update/excotel/call-details/webhook", webhookUrlOfResturantOwnerPickupCall)
userRouter.get("/read/my-orders/in-progress", authMiddleware, getMyAllOrderInProgress)
userRouter.get("/read/my-all-orders", authMiddleware, getAllMyOrder)
userRouter.get("/read/my-single-order/detail/:orderId", authMiddleware, getSingleOrderDetails)
userRouter.patch("/my-order/:orderId/cancel", authMiddleware, cancelOrderByRequest)


module.exports = { userRouter };