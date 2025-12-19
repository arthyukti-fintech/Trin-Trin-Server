const express = require("express");
const { getMenusByRestaurant, createMenu, updateMenu, deleteMenu } = require("../controllers/create/menuManagement");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");
const menuRouters = express.Router()

menuRouters.get("/:restaurantId/menus", getMenusByRestaurant);
menuRouters.post("/:restaurantId/menus", adminMiddleware, createMenu);

// menu.routes.js
menuRouters.patch("/:id", updateMenu);
menuRouters.delete("/:id", deleteMenu);

module.exports = { menuRouters };