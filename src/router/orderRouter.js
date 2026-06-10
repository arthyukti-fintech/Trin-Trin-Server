const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { queueOrderOfMenuItems } = require("../controllers/create/orderController");
const { commanMiddleware } = require("../middleware/commanMiddleware");
const { getAllOrderList } = require("../controllers/read/comman");

const orderRouter = express.Router({
    caseSensitive: true,
    strict: true
});

orderRouter.post("/v1/placed/new-order", authMiddleware, queueOrderOfMenuItems)
orderRouter.get("/v1/order/order-list/:RestaurantId", commanMiddleware, getAllOrderList)


module.exports = { orderRouter };