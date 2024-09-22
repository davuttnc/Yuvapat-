const mongoose = require('mongoose');


const Schema = mongoose.Schema;
const defaultProfileImage = '../../images/';
const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: defaultProfileImage }, // Varsayılan profil resmi
  isAdmin: { type: Boolean, default: false }, // Admin rolü
});

module.exports = mongoose.model('User', userSchema);



