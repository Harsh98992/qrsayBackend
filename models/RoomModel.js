const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant", // Reference to the Restaurant model
    required: true,
  },
  room: [
    {
      roomName: {
        type: String,
        required: true,
      },
    },
  ],
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
