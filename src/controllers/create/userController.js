const { default: mongoose } = require("mongoose");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/apiError");
const { Order } = require("../../models/Order");
const { ApiResponse } = require("../../utils/apiResponse");

const cancelOrderByRequest = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return next(new ApiError("Invalid orderId ID.", 400));
    }
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
        return next(new ApiError("Not order found for this account"))
    }
    if (!order.canBeCancelled()) {
        return next(new ApiError("Order cannot be cancelled at this stage", 400));
    }

    order.status = 'cancelled';
    order.isInProgress = false;
    order.statusHistory.push({
        status: 'cancelled',
        preparationStatus: order.preparationStatus,
        timestamp: new Date(),
        note: `Order cancelled by user. Reason: ${req?.body?.reason || 'Not specified'}`,
        updatedBy: 'user'
    });

    await order.save();

    return res.status(200).json(new ApiResponse(200, {}, "Order cancelled successfully"))

})

module.exports = { cancelOrderByRequest }