const { default: mongoose } = require("mongoose");
const { Restaurant } = require("../../models/restaurant.model");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { Profile } = require("../../models/profile.model");
const { Order } = require("../../models/Order");

const readDashboardProfile = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    if (!userId) {
        return next(new ApiError("Unauthorized access. Please login first.", 401));
    }

    const profile = await Profile.findById(userId).select("-sessions -activityLog -ip -userAgent -os -accessToken ")


    if (!profile) {
        return next(new ApiError("Profile not found.", 404));
    }

    if (profile.status === "pending") {
        return next(
            new ApiError(
                "Your account is currently under review. Please wait for admin approval.",
                404
            )
        );
    }

    if (profile.status === "rejected") {
        return next(
            new ApiError(
                "Your account request has been rejected. Please contact support.",
                404
            )
        );
    }
    return res.status(200).json(
        new ApiResponse(200, profile, "Profile fetched successfully.")
    );

})

const getAllResturantsRoleBase = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const role = req.role
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    if (page < 1 || limit < 1) {
        return next(new ApiError("Page and limit must be positive numbers.", 400));
    }

    const skip = (page - 1) * limit;
    let matchStage = {};

    if (role === "resturantsOwner") {
        matchStage = { resturantOwner: new mongoose.Types.ObjectId(userId) };
    } else if (role !== "admin" && role !== "superAdmin") {
        return next(new ApiError("Unauthorized access. Access allowed only to Admin or RestaurantOwner", 403));
    }

    const total = await Restaurant.countDocuments(matchStage);
    const restaurants = await Restaurant.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
    ]);

    // if (!restaurants || restaurants.length === 0) {
    //     return next(new ApiError("No restaurants found.", 404));
    // }

    const totalPages = Math.ceil(total / limit)
    return res.status(200).json(
        new ApiResponse(200, {
            restaurants,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                perPage: limit,
            },
        }, "Restaurants fetched successfully")
    );

})

const getRestaurantById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError("Invalid account ID.", 400));
    }

    const restaurant = await Restaurant.findById(id).lean();

    if (!restaurant) {
        return next(new ApiError("Restaurant not found with the provided ID.", 404));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, restaurant, "Restaurant fetched successfully"));
});

const getAllOrderList = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const role = req.role;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const skip = (page - 1) * limit;

    let matchStage = {};

    if (role === "resturantsOwner") {
        const restaurant = await Restaurant.findOne({ resturantOwner: userId });
        if (!restaurant) {
            return next(new ApiError("Restaurant not found", 404));
        }
        matchStage.restaurant = new mongoose.Types.ObjectId(restaurant._id);
    } else if (role !== "admin" && role !== "superAdmin") {
        return next(
            new ApiError(
                "Unauthorized access. Access allowed only to Admin or RestaurantOwner",
                403
            )
        );
    }


    if (search) {
        matchStage["items.itemName"] = {
            $regex: search,
            $options: "i",
        };
    }

    if (status) {
        matchStage.status = status;
    }

    const total = await Order.countDocuments(matchStage);

    const orderList = await Order.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                orderList,
                pagination: {
                    total,
                    totalPages,
                    currentPage: page,
                    perPage: limit,
                },
            },
            "Order list fetched successfully"
        )
    );
});


const getAllOrderListOfSingleResturants = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const role = req.role;
    const { resturantId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(resturantId)) {
        return next(new ApiError("Invalid account ID.", 400));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const skip = (page - 1) * limit;

    let matchStage = {};

    if (role === "resturantsOwner") {
        const restaurant = await Restaurant.findById(resturantId);
        if (!restaurant) {
            return next(new ApiError("Restaurant not found", 404));
        }
        matchStage.restaurant = new mongoose.Types.ObjectId(resturantId);
    } else if (role !== "admin" && role !== "superAdmin") {
        return next(
            new ApiError(
                "Unauthorized access. Access allowed only to Admin or RestaurantOwner",
                403
            )
        );
    }


    if (search) {
        matchStage["items.itemName"] = {
            $regex: search,
            $options: "i",
        };
    }

    if (status) {
        matchStage.status = status;
    }

    const total = await Order.countDocuments(matchStage);

    const orderList = await Order.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                orderList,
                pagination: {
                    total,
                    totalPages,
                    currentPage: page,
                    perPage: limit,
                },
            },
            "Order list fetched successfully"
        )
    );
});

const readAllUserList = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const {
        search = "",
        status,
        gender,
        isActive
    } = req.query;

    const matchCondition = {
        role: "user"
    };

    console.log("jnkljk", search)

    if (search) {
        const searchWords = search.trim().split(/\s+/);

        matchCondition.$and = searchWords.map(word => ({
            $or: [
                { fullName: { $regex: word, $options: "i" } },
                { email: { $regex: word, $options: "i" } },
                { phoneNumber: { $regex: word, $options: "i" } }
            ]
        }));
    }

    if (status) {
        matchCondition.status = status;
    }

    if (gender) {
        matchCondition.gender = gender;
    }

    if (typeof isActive !== "undefined") {
        matchCondition.isActive = isActive === "true";
    }

    const [users, totalCount] = await Promise.all([
        Profile.aggregate([
            { $match: matchCondition },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _1d: 1,
                    phoneNumber:1,
                    status:1,
                    gender:1,
                    profileId:1,
                    fullName:1,
                    email:1
                }
            }
        ]),
        Profile.countDocuments(matchCondition)
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        })
    );
});


module.exports = { getAllResturantsRoleBase, readAllUserList, readDashboardProfile, getRestaurantById, getAllOrderList, getAllOrderListOfSingleResturants }