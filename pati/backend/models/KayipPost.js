const mongoose = require('mongoose');
const Schema = mongoose.Schema;  // Schema'yı mongoose'tan tanımlıyoruz

const kayipPostSchema = new Schema({
  text: { type: String, required: true },
  images: [{ path: String }],
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    text: String,
    commentedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  konum: {  // Sadece bir string olarak saklanacak
    type: String, 
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('KayipPost', kayipPostSchema);
