const { ExpressAdapter } = require('@bull-board/express');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/dist/src/queueAdapters/bullMQ');

const orderQueue = require('./order.queue');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// 🛠 Create dashboard
createBullBoard({
  queues: [new BullMQAdapter(orderQueue)],
  serverAdapter,
});

module.exports = {
  router: serverAdapter.getRouter()
};