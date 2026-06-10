const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const http = require("http");
const { app } = require("./src/app");
const { connection } = require("./src/config/connection");
const globalErrorHandler = require("./src/utils/globalErrorHandler");
const { initIO } = require("./src/sockets/socket");
const { ApiError } = require("./src/utils/apiError");

dotenv.config({
    path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
});

const server = http.createServer(app);
initIO(server);

// Health API
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

app.use((req, res, next) => {
    next(new ApiError("Request url is not found.", 404));
});

app.use(globalErrorHandler);

(async () => {
    try {
        await connection();
        require("./src/workers/order.worker.js");

        server.listen(process.env.PORT, () => {
            console.log(
                `🚀 Server (API + Socket.IO) running on port ${process.env.PORT} in ${process.env.NODE_ENV} phase.`
            );
        });
    } catch (error) {
        console.log("❌ Failed to connect:", error);
    }
})();