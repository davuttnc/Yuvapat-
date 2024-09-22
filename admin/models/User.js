
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Kullanıcı şeması
const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }, // Şifreyi düz metin olarak sakla
  profileImage: { type: String, default: 'default.jpg' },
  isAdmin: { type: Boolean, default: false } // Admin kontrolü için
});

// Kullanıcı modelini oluştur
const User = mongoose.model('User', userSchema);

module.exports = User;
