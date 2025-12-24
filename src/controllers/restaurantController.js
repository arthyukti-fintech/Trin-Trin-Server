const { default: mongoose } = require("mongoose");
const { Restaurant } = require("../models/restaurant.model");
const { ApiError } = require("../utils/apiError");
const { ApiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { restaurantCreateSchema } = require("../validation/restaurantValidation");
const { Menu } = require("../models/menu.model");

const createRestaurant = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    if (!userId) {
        return next(new ApiError("Unauthorized access. Please login first.", 401));
    }

    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ApiError("Request body cannot be empty.", 400));
    }

    const { error, value } = restaurantCreateSchema.validate(req.body);

    if (error) {
        const validationErrors = error.details.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));

        return next(new ApiError(validationErrors, 400));
    }

    const { phoneNumber, name } = value;
    const existing = await Restaurant.findOne({
        $or: [
            { phoneNumber },
            { name: { $regex: new RegExp(`^${name}$`, "i") } }
        ]
    });

    if (existing) {
        return next(
            new ApiError(
                "A restaurant already exists with either this phone number or name.",
                400
            )
        );
    }
    const restaurant = await Restaurant.create({ ...value, resturantOwner: userId });

    return res.status(201).json(
        new ApiResponse(201, restaurant, "Restaurant created successfully.")
    );
});

const getAllResturants = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const search = req.query.search?.trim();

    if (page < 1 || limit < 1) {
        return next(new ApiError("Page and limit must be positive numbers.", 400));
    }

    const skip = (page - 1) * limit;

    // 🔍 Build search filter
    const filter = {};

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { "address.city": { $regex: search, $options: "i" } },
            { cuisine: { $regex: search, $options: "i" } },
        ];
    }

    const [restaurants, total] = await Promise.all([
        Restaurant.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Restaurant.countDocuments(filter),
    ]);

    if (!restaurants || restaurants.length === 0) {
        return next(new ApiError("No restaurants found.", 404));
    }

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                restaurants,
                pagination: {
                    total,
                    totalPages,
                    currentPage: page,
                    perPage: limit,
                },
            },
            "Restaurants fetched successfully"
        )
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

const updateRestaurant = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError("Invalid account ID.", 400));
    }

    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ApiError("Request body is empty. Nothing to update.", 400));
    }

    const { error, value } = restaurantCreateSchema
        .fork(Object.keys(restaurantCreateSchema.describe().keys), (schema) => schema.optional())
        .validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

    if (error) {
        return next(new ApiError(error.details[0].message, 400));
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, value, {
        new: true,
        runValidators: true,
    });

    if (!updatedRestaurant) {
        return next(new ApiError("Restaurant not found with this ID.", 404));
    }

    return res.status(200).json(
        new ApiResponse(200, updatedRestaurant, "Restaurant updated successfully.")
    );
})

const deleteRestaurant = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError("Invalid account ID.", 400));
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
        return next(new ApiError("Restaurant not found with the provided ID.", 404));
    }

    await restaurant.deleteOne()

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Restaurant deleted successfully"));
});

module.exports = { createRestaurant, getAllResturants, getRestaurantById, updateRestaurant, deleteRestaurant };