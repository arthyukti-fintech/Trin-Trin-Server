const express = require("express");
const { queueOrder, createMenuItem, getAvailableMenu } = require("../controllers/testController");


const testRouter = express.Router({
    caseSensitive: true,
    strict: true
});

// testRouter.post("/orders", queueOrder);
// testRouter.post("/menus", createMenuItem);
// testRouter.get("/menus", getAvailableMenu);

module.exports = { testRouter };