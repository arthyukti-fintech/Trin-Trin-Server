const express = require("express");
const { commanMiddleware } = require("../middleware/commanMiddleware");
const { getAllResturantsRoleBase, readDashboardProfile, getRestaurantById } = require("../controllers/read/comman");

const commanRouter = express.Router({
    caseSensitive: true,
    strict: true
});

commanRouter.get("/read/all-resturant", commanMiddleware, getAllResturantsRoleBase)
commanRouter.get("/read/profile", commanMiddleware, readDashboardProfile)
commanRouter.get("/read/single-resturant/:id", commanMiddleware, getRestaurantById);

module.exports = { commanRouter };