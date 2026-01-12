const express = require("express");
const {  createMenu, updateMenu, deleteMenu, uploadMenuImages } = require("../controllers/create/menuManagement");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");
const { resturantOwnerMiddleware } = require("../middleware/resturantOwnerMiddleware");
const { upload } = require("../middleware/multer.middleware");
const { getAllMenuListOfSingleResturant } = require("../controllers/read/menuManagementController");
const { deleteMenuOfRestaurant, deleteMenuImage } = require("../controllers/delete/menuManagementController");
const { updateMenuItemStock } = require("../controllers/update/menuController");
const menuRouters = express.Router()



menuRouters.post("/create/:restaurantId/menus", resturantOwnerMiddleware, createMenu);
menuRouters.patch("/menu-item/:itemId/stock", resturantOwnerMiddleware, updateMenuItemStock);
menuRouters.post("/upload/:restaurantId/menu-images", resturantOwnerMiddleware, upload.array("images", 10), uploadMenuImages);
menuRouters.get("/read/:restaurantId", getAllMenuListOfSingleResturant);
menuRouters.delete("/delete/menu-item/:resturantId/:menuId",resturantOwnerMiddleware, deleteMenuOfRestaurant);
menuRouters.delete("/delete/menu-image/:restaurantId/:imageId",resturantOwnerMiddleware, deleteMenuImage);


// menuRouters.patch("/:id", updateMenu);
// menuRouters.delete("/:id", deleteMenu);

module.exports = { menuRouters };