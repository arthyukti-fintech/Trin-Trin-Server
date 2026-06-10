const { default: mongoose } = require("mongoose");
const { Profile } = require("../../models/profile.model");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { createResturantOwnerValidationScheme } = require("../../validation/restaurantValidation");
const { Restaurant } = require("../../models/restaurant.model");
const { Order } = require("../../models/Order");
const { orderPrepartionStatus } = require("../../sockets/emitter");

const createRestaurantOwnerAccount = asyncHandler(async (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ApiError("Request body cannot be empty.", 400));
    }
    const { error } = createResturantOwnerValidationScheme.validate(req.body);
    if (error) {
        console.log(error)
        return next(new ApiError(error.details[0].message, 400));
    }

    const { phoneNumber, fullName, dob, email, password } = req.body;
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ip = req.ip || req.connection.remoteAddress;
    const ipv4 = ip.replace('::ffff:', '');
    const os = req.useragent?.os || "Unknown";

    const existingProfile = await Profile.findOne({ $or: [{ email, phoneNumber }] });

    if (existingProfile) {
        return next(
            new ApiError(
                "Account already exists with this email or phone number",
                409
            )
        );
    }

    const profile = await Profile.create({
        ip,
        userAgent,
        os,
        phoneNumber,
        fullName,
        email,
        role: "resturantsOwner",
        password,
        dob,
    });

    const accessToken = await profile.generateRefreshToken ();
    profile.sessions.push({ token: accessToken });
    if (profile.sessions.length > 30) {
        profile.sessions = profile.sessions.slice(-30);
    }
    profile.accessToken = accessToken;
    await profile.save({ validateBeforeSave: false });
    return res
        .status(201)
        .json(new ApiResponse(201, { accessToken }, "Your restaurant owner account has been created successfully and is pending administrative approval."));
})

const updateOrderPreparation = asyncHandler(async (req, res, next) => {
    const userId = req.userId
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ApiError("Request body cannot be empty.", 400));
    }
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return next(new ApiError("Invalid orderId ID.", 400));
    }

    const { preparationStatus } = req.body;
    const validStatuses = [
        'not_started',
        'preparing',
        'ready',
        'picked_up',
        'out_for_delivery',
        'delivered'
    ];

    if (!validStatuses.includes(preparationStatus)) {
        return next(new ApiError("Invalid preparation status", 400))
    }


    const restaurants = await Restaurant.find({ resturantOwner: userId })
        .select("_id")
        .lean();

    const restaurantIds = restaurants.map(r => r._id);

    const order = await Order.findOne({
        _id: orderId,
        restaurant: { $in: restaurantIds }
    });
    if (!order) {
        return next(new ApiError("Order not found", 400))
    }

    order.preparationStatus = preparationStatus;
    order.statusHistory.push({
        status: order.status,
        preparationStatus: preparationStatus,
        timestamp: new Date(),
        note: `Preparation status updated to ${preparationStatus}`,
        updatedBy: 'restaurant'
    });

    await order.save();

    orderPrepartionStatus(order.userId, order.getStatusMessage())

    return res.status(200).json(new ApiResponse(200, {
        progressPercentage: order.getProgressPercentage(),
        isInProgress: order.isInProgress,
        order: {
            orderId: order._id,
            status: order.status,
            preparationStatus: order.preparationStatus
        }
    }, order.getStatusMessage()))
})

const orderPreparationCompleted = asyncHandler(async (req, res, next) => {
    const userId = req.userId

    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return next(new ApiError("Invalid orderId ID.", 400));
    }

    const restaurants = await Restaurant.find({ resturantOwner: userId })
        .select("_id")
        .lean();

    const restaurantIds = restaurants.map(r => r._id);

    const order = await Order.findOne({
        _id: orderId,
        restaurant: { $in: restaurantIds }
    });

    if (!order) {
        return next(new ApiError("Order not found", 400))
    }

    order.status = 'completed';
    order.preparationStatus = 'delivered';
    order.isInProgress = false;
    order.completedAt = new Date();
    order.actualDeliveryTime = new Date();

    order.statusHistory.push({
        status: 'completed',
        preparationStatus: 'delivered',
        timestamp: new Date(),
        note: 'Order marked as completed',
        updatedBy: 'restaurant'
    });

    await order.save();
    orderPrepartionStatus(order.userId, "Order completed successfully")
    return res.status(200).json(new ApiResponse(200, {}, "Order completed successfully"))
})

module.exports = { createRestaurantOwnerAccount, updateOrderPreparation, orderPreparationCompleted }