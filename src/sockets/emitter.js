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