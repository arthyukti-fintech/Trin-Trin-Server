const { Worker, QueueEvents } = require('bullmq');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const redis = require('../utils/redisClient');

const { Order } = require('../models/Order');
const { emitOrderPlaced, emitAvailabilityChange } = require('../sockets/emitter');
const { Menu } = require('../models/menu.model');

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const worker = new Worker('orderQueue', async job => {
  const { userId, items, timeSlot, restaurantId } = job.data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderedItems = [];
    for (const item of items) {
      const menuItem = await Menu.findOneAndUpdate(
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

      if (menuItem.stock === 0 && menuItem.isAvailable !== false) {
        menuItem.isAvailable = false;
        await menuItem.save({ session });
        emitAvailabilityChange(menuItem._id, false);
      }

      orderedItems.push({
        item: item.itemId,
        quantity: item.quantity,
        itemName: item.itemName

      });
    }

    const [order] = await Order.create(
      [{
        user: userId,
        items: orderedItems,
        restaurant:restaurantId,
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