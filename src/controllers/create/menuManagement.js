const { default: mongoose } = require("mongoose");
const fs = require("fs");
const { Menu } = require("../../models/menu.model");
const { Restaurant } = require("../../models/restaurant.model");
const { ApiError } = require("../../utils/apiError");
const { asyncHandler } = require("../../utils/asyncHandler");
const {
  createMenuValidationSchema,
} = require("../../validation/createMenuValidationSchema ");
const { ApiResponse } = require("../../utils/apiResponse");
const { getFileHash } = require("../../utils/checkDuplicateFile");
const { uploadOnCloudinary } = require("../../utils/cloudinary");

const createMenu = asyncHandler(async (req, res, next) => {
  const userId = req.userId;

  if (!userId) {
    return next(new ApiError("Unauthorized", 401));
  }

  const { restaurantId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    return next(new ApiError("Invalid restaurant ID", 400));
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ApiError("Request body cannot be empty.", 400));
  }

  const { error, value } = createMenuValidationSchema.validate(req.body);

  if (error) {
    const validationErrors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return next(new ApiError(validationErrors, 400));
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return next(new ApiError("Restaurant not found", 404));
  }

  if (!restaurant.isActive) {
    return next(
      new ApiError(
        "Your account is disabled. Please contact the support team to reactivate it.",
        403
      )
    );
  }

  if (restaurant.resturantOwner.toString() !== userId.toString()) {
    return next(
      new ApiError("You are not allowed to add menu for this restaurant", 403)
    );
  }

  const { menuName, price, isVeg, description, category, stock } =
    req.body;

  const existingMenu = await Menu.findOne({
    restaurant: restaurantId,
    menuName: menuName.trim(),
  });

  if (existingMenu) {
    return next(
      new ApiError("This menu item already exists for the restaurant.", 409)
    );
  }

  const menu = await Menu.create({
    menuName,
    price,
    isVeg,
    description,
    category,
    stock,
    restaurant: restaurantId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, menu, "Menu created successfully"));
});

const uploadMenuImages = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  const { restaurantId } = req.params;

  if (!userId) return next(new ApiError("Unauthorized", 401));
  if (!mongoose.Types.ObjectId.isValid(restaurantId))
    return next(new ApiError("Invalid restaurant ID", 400));

  const files = req.files;
  if (!files || files.length === 0)
    return next(new ApiError("No files uploaded", 400));

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) return next(new ApiError("Restaurant not found", 404));
  if (!restaurant.isActive)
    return next(
      new ApiError(
        "Your account is disabled. Please contact the support team.",
        403
      )
    );
  if (restaurant.resturantOwner.toString() !== userId.toString())
    return next(
      new ApiError("You are not allowed to add menu for this restaurant", 403)
    );

  const uploadedImages = [];

  for (const file of files) {
    try {
      const fileHash = await getFileHash(file.path);

      const existingMenuWithImage = await Menu.findOne({
        restaurant: restaurantId,
        "image.hash": fileHash
      });

      if (existingMenuWithImage) {
        await fs.promises.unlink(file.path);
        continue;
      }

      const cloudinaryResult = await uploadOnCloudinary(file.path);
      if (!cloudinaryResult?.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      uploadedImages.push({
        imageUrl: cloudinaryResult.secure_url,
        hash: fileHash
      });
    } catch (err) {
      console.error("File processing error:", err);
      if (fs.existsSync(file.path)) await fs.promises.unlink(file.path);
    }
  }

  if (uploadedImages.length === 0) {
    return next(
      new ApiError(
        "All uploaded images were duplicates or failed to upload",
        400
      )
    );
  }

  let menu = await Menu.findOne({ restaurant: restaurantId });

  if (menu) {
    menu.image.push(...uploadedImages);
    await menu.save();

    return res.status(200).json(
      new ApiResponse(200, menu, "Menu updated successfully")
    );
  }

  const newMenu = await Menu.create({
    restaurant: restaurantId,
    image: uploadedImages
  });

  return res.status(201).json(
    new ApiResponse(201, newMenu, "Menu created successfully")
  );
});

// const getMenusByRestaurant = asyncHandler(async (req, res, next) => {
//   const { restaurantId } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
//     return next(new ApiError("Invalid restaurant ID.", 400));
//   }

//   const menus = await Menu.find({ restaurant: restaurantId }).sort({
//     createdAt: -1,
//   });

//   if (!menus.length) {
//     return next(new ApiError("No menu items found.", 404));
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, menus, "Menus fetched successfully"));
// });

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

module.exports = {
  createMenu,
  uploadMenuImages,
  updateMenu,
  deleteMenu,
};
