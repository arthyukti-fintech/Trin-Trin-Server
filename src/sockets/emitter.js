const { getIO } = require("./socket");

exports.emitMenuUpdate = (item) => {
  const io = getIO();
  io.emit('menuUpdated', item);
};

exports.emitAvailabilityChange = (itemId, isAvailable) => {
  const io = getIO();
  io.emit('availabilityChanged', { itemId, isAvailable });
};

exports.emitOrderPlaced = (order) => {
  const io = getIO();
  io.emit('orderPlaced', order);
};


exports.failedTopPlacedOrder = (userId, resturantUserId, item) => {
  const io = getIO();

  console.log("items list", item)
  io.to(userId.toString()).emit("failedToPlacedOrder", item);
  io.to(resturantUserId.toString()).emit("failedToPlacedOrder", item);
};
