const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const İletisimFormSchema = new Schema({
    name: String,
    email: String,
    message: String,
    date: { type: Date, default: Date.now },
  });

module.exports = mongoose.model('İletisimForm', İletisimFormSchema);