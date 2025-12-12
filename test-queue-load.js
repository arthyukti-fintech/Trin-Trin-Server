const path = require("path");
const dotenv = require("dotenv");
const { Queue } = require('bullmq');
const redis = require("./src/utils/redisClient");

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
});

const orderQueue = new Queue('orderQueue', {
  connection: redis,
});

(async () => {
  console.time('Job Enqueue');

  const totalJobs = 100000;

  const jobs = [];
  for (let i = 0; i < totalJobs; i++) {
    jobs.push({
      name: `order-${i}`,
      data: {
        userId: `user_${i}`,
        timeSlot: new Date(),
        items: [
          { itemId: "656fe1234567899876abc456", quantity: 1 }
        ],
      },
    });
  }

  // Add all jobs in bulk
  await orderQueue.addBulk(jobs);
  console.log(`✅ ${totalJobs} jobs added to the queue.`);

  console.timeEnd('Job Enqueue');
})();