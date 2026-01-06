const express = require("express");
const cors = require("cors");
const useragent = require('express-useragent');
const helmet = require('helmet');
const morgan = require('morgan');
const { router } = require("./queues/bull.dashboard");
const { authRouter } = require("./router/authRouter");
const { resturantRouter } = require("./router/restaurantRouter");
// const { testRouter } = require("./router/queueTestingRouter");
const { profileRouter } = require("./router/profileRouter");
const { adminRouter } = require("./router/adminRouter");
const { superAdminRouter } = require("./router/superAdminRouter");
const { menuRouters } = require("./router/menuRouter");
const { commanRouter } = require("./router/commanRouter");



const app = express();

app.use(express.json({ limit: "5mb" }));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(useragent.express());

const allowedOrigins = {
    production: [
        "https://assetlend.in",
        "www.assetlend.in",
    ],
    staging: [
        "http://localhost:5173",
        "http://localhost:5174"
    ]
};

const corsOptions = {
    origin: function (origin, callback) {

        const env = process.env.NODE_ENV || "development";

        // Development and Staging: allow all
        if (env === "development" || env === "staging") {
            return callback(null, true);
        }

        // Production: restrict to allowed frontends
        if (!origin) {
            // block Postman/curl in production
            return callback(new Error(`CORS not allowed for requests without origin in ${env}`));
        }

        if (allowedOrigins[env] && allowedOrigins[env].includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS not allowed for origin ${origin} in ${env}`));
    },
    credentials: true,
};

app.use(cors(corsOptions));

app.use("/auth", authRouter);
app.use('/admin/queues', router);
app.use("/api", profileRouter);
app.use("/restaurants", resturantRouter);
app.use("/admin", adminRouter);
app.use("/super-admin", superAdminRouter);
app.use("/menu", menuRouters);
app.use("/comman", commanRouter);

module.exports = { app }