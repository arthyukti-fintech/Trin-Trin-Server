const express = require("express")
const { createRestaurant, getAllResturants, getRestaurantById, updateRestaurant, deleteRestaurant } = require("../controllers/restaurantController");

const resturantRouter = express.Router()
// Later we can add firebaseAuth middleware if needed
resturantRouter.post("/create", createRestaurant);
resturantRouter.get("/getall", getAllResturants);
resturantRouter.get("/getall/:id", getRestaurantById);
resturantRouter.patch("/update/:id", updateRestaurant);
resturantRouter.delete("/delete/:id", deleteRestaurant);

module.exports = { resturantRouter }
