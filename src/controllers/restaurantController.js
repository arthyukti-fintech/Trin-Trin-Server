const { Restaurant } = require("../models/restaurant.model");
const { ApiError } = require("../utils/apiError");
const { ApiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { restaurantCreateSchema } = require("../validation/restaurantValidation");

const createRestaurant = asyncHandler(async (req, res, next) => {
    const { error } = restaurantCreateSchema.validate(req.body);

    if (error) {
        return next(new ApiError(error.details[0].message, 400));
    }

    const { phoneNumber, name } = req.body;

    const existing = await Restaurant.findOne({ phoneNumber, name });

    if (existing) {
        return next(new ApiError("Restaurant already exists with this phone number.", 400));
    }

    const restaurant = await Restaurant.create(req.body);

    return res
        .status(201)
        .json(new ApiResponse(201, restaurant, "Restaurant created successfully"));
});

const getAllResturants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 })

    return res.status(200).json(new ApiResponse(200, restaurants, "Restaurants fetched successfully"))
})

const getRestaurantById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
        return next(new ApiError("Restaurant not found.", 404));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, restaurant, "Restaurant fetched successfully"));
});

const updateRestaurant = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { error } = restaurantCreateSchema.validate(req.body, { allowUnknown: true });

    if (error) {
        return next(new ApiError(error.details[0].message, 400));
    }

    const restaurant = await Restaurant.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!restaurant) {
        return next(new ApiError("Restaurant not found.", 404));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, restaurant, "Restaurant updated successfully"));
});

const deleteRestaurant = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const restaurant = await Restaurant.findByIdAndDelete(id);

    if (!restaurant) {
        return next(new ApiError("Restaurant not found.", 404));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Restaurant deleted successfully"));
});

module.exports = { createRestaurant, getAllResturants, getRestaurantById, updateRestaurant, deleteRestaurant };
