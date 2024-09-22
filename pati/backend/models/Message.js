const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  roomId: { type: String, required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;