// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'KayipPost', required: true },
  reason: { type: String, required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
