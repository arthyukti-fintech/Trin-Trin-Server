const { getIO } = require("./socket");

exports.emitMenuUpdate = (item) => {
  const io = getIO();
  io.emit('menuUpdated', item);
};

exports.emitAvailabilityChange = (itemId, isAvailable) => {
  const io = getIO();
  io.emit('availabilityChanged', { itemId, isAvailable });
};

exports.emitOrderPlaced = (order, userId, resturantUserId) => {
  const io = getIO();

  if (!userId || !resturantUserId) return;

  io.to(userId.toString()).emit("orderPlaced", order);
  io.to(resturantUserId.toString()).emit("orderPlaced", order);
};


exports.orderPrepartionStatus = (userId, msg) => {
  const io = getIO();
  io.to(userId.toString()).emit("orderPrepartionStatus", msg);
}


exports.failedTopPlacedOrder = (userId, resturantUserId, item) => {
  const io = getIO();
  console.log("orderbbbnbn", userId)
  io.to(userId.toString()).emit("failedToPlacedOrder", item);
  io.to(resturantUserId.toString()).emit("failedToPlacedOrder", item);
};

exports.updateStatusOfCallerUpdate = (userId, callerDetials) => {
  const io = getIO();

  io.to(userId.toString()).emit("excotelCallerDetailsLiveUpdate", callerDetials);
};
