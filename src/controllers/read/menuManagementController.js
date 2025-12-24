const { default: mongoose } = require("mongoose");
const { Menu } = require("../../models/menu.model");
const { Restaurant } = require("../../models/restaurant.model");
const { ApiError } = require("../../utils/apiError");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiResponse } = require("../../utils/apiResponse");

const getAllMenuListOfSingleResturant = asyncHandler(async (req, res, next) => {
    const { restaurantId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        return next(new ApiError("Invalid account ID.", 400));
    }

    const menuList = await Menu.find({ restaurant: restaurantId })
    return res.status(200).json(new ApiResponse(200, { menuList: menuList || [] }))

})

module.exports = { getAllMenuListOfSingleResturant }