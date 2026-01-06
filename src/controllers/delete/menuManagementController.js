const { default: mongoose } = require("mongoose");
const { Restaurant } = require("../../models/restaurant.model");
const { ApiError } = require("../../utils/apiError");
const { asyncHandler } = require("../../utils/asyncHandler");
const { Menu } = require("../../models/menu.model");
const { uploadOnCloudinary } = require("../../utils/cloudinary");
const { ApiResponse } = require("../../utils/apiResponse");

const deleteMenuOfRestaurant = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  const { menuId, resturantId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(menuId) || !mongoose.Types.ObjectId.isValid(resturantId)) {
    return next(new ApiError("Invalid menu ID or restaurant ID.", 400));
  }

  const restaurant = await Restaurant.findById(resturantId);
  if (!restaurant) {
    return next(new ApiError("Restaurant not found.", 404));
  }

  if (!restaurant.isActive) {
    return next(new ApiError("Your restaurant account is inactive.", 403));
  }

  if (restaurant.resturantOwner.toString() !== userId.toString()) {
    return next(new ApiError("You are not authorized to delete this menu.", 403));
  }

  const menu = await Menu.findOne({ _id: menuId, restaurant: resturantId });
  if (!menu) {
    return next(new ApiError("Menu not found or does not belong to this restaurant.", 404));
  }

  if (Array.isArray(menu.image)) {
    for (const img of menu.image) {
      if (img.hash) {
        try {
          await cloudinary.uploader.destroy(img.hash);
          console.log(`✅ Deleted Cloudinary image: ${img.hash}`);
        } catch (cloudErr) {
          console.error(`❌ Failed to delete Cloudinary image (${img.hash}):`, cloudErr.message);
        }
      }
    }
  }

  await Menu.deleteOne({ _id: menuId });

  return res.status(200).json(
    new ApiResponse(200, {}, "Menu deleted successfully and associated images removed.")
  );
});

module.exports = { deleteMenuOfRestaurant }