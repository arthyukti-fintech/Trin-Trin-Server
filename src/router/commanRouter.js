const express = require("express");
const { commanMiddleware } = require("../middleware/commanMiddleware");
const { getAllResturantsRoleBase, readDashboardProfile, getRestaurantById, getAllOrderListOfSingleResturants, readAllUserList } = require("../controllers/read/comman");

const commanRouter = express.Router({
    caseSensitive: true,
    strict: true
});

commanRouter.get("/read/all-resturant", commanMiddleware, getAllResturantsRoleBase)
commanRouter.get("/read/profile", commanMiddleware, readDashboardProfile)
commanRouter.get("/read/single-resturant/:id", commanMiddleware, getRestaurantById);
commanRouter.get("/read/all-order/single-restaurant/:resturantId", commanMiddleware, getAllOrderListOfSingleResturants);
commanRouter.get("/read/api/users", commanMiddleware, readAllUserList);

module.exports = { commanRouter };