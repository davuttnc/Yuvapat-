// data/db.js

const mongoose = require('mongoose');
require('dotenv').config(); 
// MongoDB bağlantı URL'si
const dbURI = process.env.MONGO_URI ;

// MongoDB'ye bağlanma işlemi
mongoose.connect(dbURI)
  .then(() => console.log('MongoDB bağlantısı başarılı.'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Bağlantı hatası mesajı
mongoose.connection.on('error', err => {
  console.error('MongoDB bağlantı hatası:', err);
});

// Bağlantı kesildiğinde mesaj
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB bağlantısı kesildi.');
});

module.exports = mongoose;
