const { Worker, QueueEvents } = require('bullmq');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const redis = require('../utils/redisClient');

const { MenuItem } = require('../models/MenuItem');
const { Order } = require('../models/Order');
const { emitOrderPlaced, emitAvailabilityChange } = require('../sockets/emitter');

// ✅ Load environment variables
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
});

console.log("📦 MONGO_URI:", process.env.MONGO_URI);

// ✅ Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const worker = new Worker('orderQueue', async job => {
  const { userId, items, timeSlot } = job.data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderedItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findOneAndUpdate(
        {
          _id: item.itemId,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        { new: true, session }
      );
      if (!menuItem) {
        throw new Error(`Not enough stock for item ${item.itemId}`);
      }

      if (menuItem.stock === 0 && menuItem.available !== false) {
        // Only mark unavailable if it's not already
        menuItem.available = false;
        await menuItem.save({ session });

        emitAvailabilityChange(menuItem._id, false);
      }

      orderedItems.push({
        item: item.itemId,
        quantity: item.quantity,
      });
    }

    const [order] = await Order.create(
      [{
        user: userId,
        items: orderedItems,
        timeSlot,
        status: 'confirmed',
      }],
      { session }
    );

    await session.commitTransaction();

    emitOrderPlaced(order);
    console.log(`✅ Job ${job.id} completed`);

    return order;

  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error(`❌ Job ${job.id} failed:`, err);
    throw err;
  } finally {
    session.endSession();
  }

}, {
  concurrency: 1000,
  connection: redis,
});

const queueEvents = new QueueEvents('orderQueue', { connection: redis });

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Job Failed: ID=${jobId}, Reason=${failedReason}`);
});