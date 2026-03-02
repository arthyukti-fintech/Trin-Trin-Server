const express = require("express")
const { createRestaurant, getAllResturants, updateRestaurant, deleteRestaurant } = require("../controllers/restaurantController");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const { createRestaurantOwnerAccount, updateOrderPreparation, orderPreparationCompleted } = require("../controllers/update/resturantOwnerController");
const { resturantOwnerMiddleware } = require("../middleware/resturantOwnerMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");
const { commanMiddleware } = require("../middleware/commanMiddleware");
const { getAllActiveOrderOfRestaurant } = require("../controllers/read/comman");

const resturantRouter = express.Router()

// update
resturantRouter.post("/auth/signup", createRestaurantOwnerAccount);
resturantRouter.post("/create", resturantOwnerMiddleware, createRestaurant);
resturantRouter.get("/getall", authMiddleware, getAllResturants);
resturantRouter.get("/read/:restaurantId/active-orders", commanMiddleware, getAllActiveOrderOfRestaurant);
resturantRouter.patch("/update/:id", commanMiddleware, updateRestaurant);
resturantRouter.patch("/update/order/:orderId/preparation-status", commanMiddleware, updateOrderPreparation);
resturantRouter.patch("/update/order/:orderId/complete", commanMiddleware, orderPreparationCompleted);
resturantRouter.delete("/delete/:id", adminMiddleware, deleteRestaurant);

module.exports = { resturantRouter }
