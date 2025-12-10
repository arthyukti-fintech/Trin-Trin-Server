const { Worker } = require('bullmq');
const mongoose = require('mongoose');

dotenv.config({
    path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
});

mongoose.connect(process.env.MONGO_URI);

const worker = new Worker('orderQueue', async job => {
  const { userId, items, timeSlot } = job.data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderedItems = [];

    for (let item of items) {
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

      if (menuItem.stock === 0) {
        menuItem.available = false;
        await menuItem.save({ session });
        emitAvailabilityChange(menuItem._id, false);
      }

      orderedItems.push({
        item: item.itemId,
        quantity: item.quantity,
      });
    }

    const order = await Order.create(
      [{
        user: userId,
        items: orderedItems,
        timeSlot,
        status: 'confirmed',
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    emitOrderPlaced(order[0]); // 👈 Realtime to admins or users
    return order[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ Job failed:', err);
    throw err;
  }
}, {
  concurrency: 5,  // 🧠 PLAYSAFE: 5 jobs at a time
  connection: redis,
});

const queueEvents = new QueueEvents('orderQueue', { connection: redis });
queueEvents.on('failed', (jobId, failedReason) => {
  console.error(`❌ Job ${jobId} failed: ${failedReason}`);
});
