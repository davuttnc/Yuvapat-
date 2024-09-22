const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  cins: { type: String, required: true },
  text: { type: String, required: true },
  images: [{ path: String }],
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    text: String,
    commentedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
