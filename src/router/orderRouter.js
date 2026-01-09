const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { queueOrderOfMenuItems } = require("../controllers/create/orderController");

const orderRouter = express.Router({
    caseSensitive: true,
    strict: true
});

orderRouter.post("/v1/placed/new-order",authMiddleware,queueOrderOfMenuItems)


module.exports = { orderRouter };