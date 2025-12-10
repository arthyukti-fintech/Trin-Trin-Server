const { Queue } = require('bullmq');
const redis = require('../utils/redisClient');


const orderQueue = new Queue('orderQueue', {
  connection: redis
});

module.exports = orderQueue;