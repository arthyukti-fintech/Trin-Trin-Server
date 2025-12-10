const Redis = require("ioredis");
const dotenv = require("dotenv")
const path = require("path");

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
});

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  family: 4,
  connectTimeout: 10000, 
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

module.exports = redis;