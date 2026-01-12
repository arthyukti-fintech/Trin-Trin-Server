const express = require("express")
const { createRestaurant, getAllResturants, updateRestaurant, deleteRestaurant } = require("../controllers/restaurantController");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const { createRestaurantOwnerAccount } = require("../controllers/update/resturantOwnerController");
const { resturantOwnerMiddleware } = require("../middleware/resturantOwnerMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");

const resturantRouter = express.Router()

// update
resturantRouter.post("/auth/signup", createRestaurantOwnerAccount);
resturantRouter.post("/create", resturantOwnerMiddleware, createRestaurant);
resturantRouter.get("/getall", authMiddleware, getAllResturants);
resturantRouter.patch("/update/:id", adminMiddleware, updateRestaurant);
resturantRouter.delete("/delete/:id", adminMiddleware, deleteRestaurant);

module.exports = { resturantRouter }
