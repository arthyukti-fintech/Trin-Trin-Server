let io;

const allowedOrigins = {
  production: [
    "https://assetlend.in",
    "https://www.assetlend.in",
  ],
  staging: [
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  development: ["*"], 
};

function initIO(server) {
  const env = process.env.NODE_ENV ;

  io = require("socket.io")(server, {
    cors: {
      origin: (origin, callback) => {
        if (env === "development"||env === "staging") {
          return callback(null, true);
        }

        if (!origin) {
          return callback(
            new Error(`❌ Socket CORS blocked: Missing origin in ${env}`)
          );
        }

        if (allowedOrigins[env] && allowedOrigins[env].includes(origin)) {
          return callback(null, true);
        }

        return callback(
          new Error(`❌ Socket CORS blocked for origin: ${origin} in ${env}`)
        );
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    socket.on("registerUser", (userId) => {
      if (!userId) return;
      socket.join(userId.toString());
      console.log(`✅ User registered: ${userId}, socket: ${socket.id}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}

module.exports = { initIO, getIO };