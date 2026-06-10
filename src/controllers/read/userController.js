const { default: mongoose } = require("mongoose");
const { ApiError } = require("../../utils/apiError");
const { asyncHandler } = require("../../utils/asyncHandler");
const { Restaurant } = require("../../models/restaurant.model");
const { CallPicpup } = require("../../models/callPickupProcess");
const { ApiResponse } = require("../../utils/apiResponse");
const { Order } = require("../../models/Order");

const getCallProgessDetail = asyncHandler(async (req, res, next) => {

    const userId = req.userId;
    const role = req.role;
    const { ResturantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ResturantId)) {
        return next(new ApiError("Invalid ResturantId ID.", 400));
    }

    if (role === "resturantsOwner") {
        const restaurant = await Restaurant.findOne({ resturantOwner: userId, _id: ResturantId });
        if (!restaurant) {
            return next(new ApiError("Restaurant not found with connecting call", 404));
        }
    } else if (role !== "admin" && role !== "superAdmin") {
        return next(
            new ApiError(
                "Unauthorized access. Access allowed only to Admin or RestaurantOwner",
                403
            )
        );
    }

    // const callDetail = await CallPicpup.findOne({ resturant: ResturantId, status: "in-progress" });
    const callDetail = await CallPicpup.aggregate([
        {
            $match: {
                resturant: new mongoose.Types.ObjectId(ResturantId),
                status: "in-progress"
            }
        },
        { $limit: 1 },
        {
            $lookup: {
                from: "profiles",
                localField: "userId",
                foreignField: "_id",
                as: "callerDetail",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullName: 1,
                            email: 1,
                            profileId: 1,
                            status: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                callerDetail: { $arrayElemAt: ["$callerDetail", 0] }
            }
        },
        {
            $project: {
                userId: 0,
                sidNumber: 0,
                createdAt: 0.

            }
        }
    ]);


    return res.status(200).json(new ApiResponse(200, callDetail[0]))


})

const getMyAllOrderInProgress = asyncHandler(async (req, res, next) => {

    const orders = await Order.find({
        userId: req.userId,
        isInProgress: true
    })
        .populate('restaurant', 'name address cuisine image rating')
        .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
        orderId: order._id,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        restaurant: {
            id: order.restaurant._id,
            name: order.restaurant.name,
            address: order.restaurant.address,
            phone: order.restaurant.phone,
            image: order.restaurant.image
        },
        items: order.items.map(i => ({
            id: i._id,
            itemName: i.itemName,
            quantity: i.quantity,
            price: i.price,
        })),
        totalAmount: order.totalAmount,
        status: order.status,
        preparationStatus: order.preparationStatus,
        statusMessage: order.getStatusMessage(),
        progressPercentage: order.getProgressPercentage(),
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        canCancel: order.canBeCancelled(),
        orderDate: order.createdAt,
        deliveryAddress: order.deliveryAddress,
        specialInstructions: order.specialInstructions,
        paymentMethod: order.paymentMethod,
        isInProgress: order.isInProgress
    }));
    return res.status(200).json(new ApiResponse(200, formattedOrders))
})

const getAllMyOrder = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const { progressOrderStatus } = req.query;
    const orderStatus = ['pending', 'confirmed', 'cancelled', 'failed', 'completed'];
    if (progressOrderStatus && !orderStatus.includes(progressOrderStatus)) {
        return next(new ApiError("Send correct status", 400))
    }
    let matchStage = {
        userId
    }
    if (progressOrderStatus) {
        matchStage.status = progressOrderStatus
    }

    console.log("order",matchStage)
  
    const ordersList = await Order.find(matchStage);
    if (!ordersList) {
        return next(new ApiError("No order found for this accound"))
    }
    const formattedOrders =await ordersList.map(order => ({
        orderId: order._id,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        restaurant: {
            id: order.restaurant._id,
            name: order.restaurant.name,
            address: order.restaurant.address,
            phone: order.restaurant.phone
        },
        items: order.items.map(i => ({
            id: i._id,
            name: i.itemName,
            quantity: i.quantity,
            price: i.price
        })),
        totalAmount: order.totalAmount,
        status: order.status,
        preparationStatus: order.preparationStatus,
        statusMessage: order.getStatusMessage(),
        progressPercentage: order.getProgressPercentage(),
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        actualDeliveryTime: order.actualDeliveryTime,
        canCancel: order.canBeCancelled(),
        orderDate: order.createdAt,
        completedAt: order.completedAt,
        isInProgress: order.isInProgress
    }));
    // const inProgressOrders = formattedOrders.filter(o => o.isInProgress);
    // const completedOrders = formattedOrders.filter(o => !o.isInProgress);
    return res.status(200).json(new ApiResponse(200, {
        allOrderList: formattedOrders,
        // inProgress: {
        //     count: inProgressOrders.length,
        //     orders: inProgressOrders
        // },
        // completed: {
        //     count: completedOrders.length,
        //     orders: completedOrders
        // }
    }))
})

const getSingleOrderDetails = asyncHandler(async (req, res, next) => {

    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return next(new ApiError("Invalid orderId ID.", 400));
    }

    const order = await Order.findOne({ _id: orderId, userId: req.userId }).select('-statusHistory')
        .populate('restaurant', 'name address cuisine image rating isVegOnly averageDeliveryTime')

    if (!order) {
        return next(new ApiError("No order found for this id", 400));
    }

    return res.status(200).json(new ApiResponse(200, {
        order: {
            orderId: order._id,
            orderNumber: order._id.toString().slice(-8).toUpperCase(),
            restaurant: order.restaurant,
            items: order.items,
            totalAmount: order.totalAmount,
            status: order.status,
            preparationStatus: order.preparationStatus,
            statusMessage: order.getStatusMessage(),
            progressPercentage: order.getProgressPercentage(),
            estimatedDeliveryTime: order.estimatedDeliveryTime,
            actualDeliveryTime: order.actualDeliveryTime,
            deliveryAddress: order.deliveryAddress,
            specialInstructions: order.specialInstructions,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            canCancel: order.canBeCancelled(),
            orderDate: order.createdAt,
            completedAt: order.completedAt,
            isInProgress: order.isInProgress,
            statusHistory: order.statusHistory
        }
    }))
})

module.exports = { getCallProgessDetail, getMyAllOrderInProgress, getSingleOrderDetails, getAllMyOrder }