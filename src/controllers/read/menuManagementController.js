const { Menu } = require("../../models/menu.model");
const { Restaurant } = require("../../models/restaurant.model");
const { ApiError } = require("../../utils/apiError");
const { asyncHandler } = require("../../utils/asyncHandler");

const getAllMenuListOfResturantOwner = asyncHandler(async (req, res, next) => {
    const userId = req.userId;

    const resturantDetails = await Restaurant.findOne({
        resturantOwner: userId
    })

    if (!resturantDetails) {
        return next(new ApiError("No Resturant found.", 400))
    }

    const menuList = await Menu.find({ restaurant: resturantDetails._id })
    

})

module.exports = { getAllMenuListOfResturantOwner }