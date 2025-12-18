const express = require("express")
const { createRestaurant, getAllResturants, getRestaurantById, updateRestaurant, deleteRestaurant } = require("../controllers/restaurantController");
const { adminMiddleware } = require("../middleware/adminMiddleware");

const resturantRouter = express.Router()

resturantRouter.post("/create", adminMiddleware, createRestaurant);
resturantRouter.get("/getall", adminMiddleware, getAllResturants);
resturantRouter.get("/getall/:id", adminMiddleware, getRestaurantById);
resturantRouter.patch("/update/:id", adminMiddleware, updateRestaurant);
resturantRouter.delete("/delete/:id", adminMiddleware, deleteRestaurant);

module.exports = { resturantRouter }
