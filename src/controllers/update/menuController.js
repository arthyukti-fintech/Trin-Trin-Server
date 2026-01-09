const { default: mongoose } = require("mongoose");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/apiError");
const { Menu } = require("../../models/menu.model");
const { ApiResponse } = require("../../utils/apiResponse");

const updateMenuItemStock = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ApiError("Request body cannot be empty.", 400));
    }
    const { itemId } = req.params;
    const { stock } = req.body;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return next(new ApiError("Invalid menu item ID.", 400));
    }

    if (typeof stock !== "number" || stock < 0) {
        return next(new ApiError("Stock must be a non-negative number.", 400));
    }

    const menuItem = await Menu.findById(itemId).populate("restaurant");
    if (!menuItem) {
        return next(new ApiError("Menu item not found.", 404));
    }

    // 🔐 Authorization
    if (menuItem.restaurant.resturantOwner.toString() !== userId.toString()) {
        return next(new ApiError("You are not authorized to update this item.", 403));
    }

    menuItem.stock = stock;
    menuItem.isAvailable = stock > 0;

    await menuItem.save();

    return res.status(200).json(
        new ApiResponse(200, menuItem, "Stock updated successfully.")
    );
});

module.exports = { updateMenuItemStock }
