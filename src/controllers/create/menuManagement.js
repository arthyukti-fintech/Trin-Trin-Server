const { default: mongoose } = require("mongoose");
const { Menu } = require("../../models/menu.model");
const { Restaurant } = require("../../models/restaurant.model");
const { ApiError } = require("../../utils/apiError");
const { asyncHandler } = require("../../utils/asyncHandler");
const { menuCreateSchema } = require("../../validation/menu.validation");

const createMenu = asyncHandler(async (req, res, next) => {
    const userId = req.userId; // logged-in user
    const { restaurantId } = req.params;
    const { name, price, isVeg } = req.body;

    console.log(restaurantId, "restaurantId")
    console.log(userId, "userId")

    // 1. Check login
    if (!userId) {
        return next(new ApiError("Unauthorized", 401));
    }

    // 2. Validate restaurantId
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        return next(new ApiError("Invalid restaurant ID", 400));
    }

    // 3. Find restaurant
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return next(new ApiError("Restaurant not found", 404));
    }

    // 4. Check ownership
    if (restaurant.resturantOwner.toString() !== userId) {
        return next(new ApiError("You are not allowed to add menu for this restaurant", 403));
    }

    // 5. Create menu
    const menu = await Menu.create({
        name,
        price,
        isVeg,
        restaurant: restaurantId,
    });

    return res.status(201).json(
        new ApiResponse(201, menu, "Menu created successfully")
    );
});

const getMenusByRestaurant = asyncHandler(async (req, res, next) => {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        return next(new ApiError("Invalid restaurant ID.", 400));
    }

    const menus = await Menu.find({ restaurant: restaurantId })
        .sort({ createdAt: -1 });

    if (!menus.length) {
        return next(new ApiError("No menu items found.", 404));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, menus, "Menus fetched successfully"));
});

const updateMenu = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError("Invalid menu ID.", 400));
    }

    const menu = await Menu.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!menu) {
        return next(new ApiError("Menu item not found.", 404));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, menu, "Menu updated successfully"));
});

const deleteMenu = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError("Invalid menu ID.", 400));
    }

    const menu = await Menu.findByIdAndDelete(id);

    if (!menu) {
        return next(new ApiError("Menu item not found.", 404));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Menu deleted successfully"));
});

module.exports = { createMenu, getMenusByRestaurant, updateMenu, deleteMenu }
