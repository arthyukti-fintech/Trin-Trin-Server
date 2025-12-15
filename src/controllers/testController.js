const { MenuItem } = require("../models/MenuItem");
const orderQueue = require("../queues/order.queue");
const { ApiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");

const createMenuItem = asyncHandler(async (req, res, next) => {
    const { name, description, price, stock } = req.body;

    if (!name || !price || !stock) {
        return next(new ApiError("All required fields are not provided.", 400));
    }

    const item = await MenuItem.create({ name, description, price, stock });

    return res
        .status(201)
        .json(new ApiResponse(201, item, "Menu item created successfully"));
});

const queueOrder = asyncHandler(async (req, res, next) => {
    const { userId, items, timeSlot } = req.body;

    if (!userId || !Array.isArray(items) || items.length === 0) {
        return next(new ApiError("Invalid order format.", 400));
    }

    const job = await orderQueue.add("new-order", {
        userId,
        items,
        timeSlot: timeSlot || new Date(),
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { jobId: job.id }, "Order queued for processing"));
})

const getAvailableMenu = asyncHandler(async (req, res, next) => {
    const items = await MenuItem.find({ available: true });

    return res.status(200).json(new ApiResponse(200, items));
});

module.exports = { queueOrder, createMenuItem, getAvailableMenu }