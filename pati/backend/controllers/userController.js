const express = require('express');
const router = express.Router();
const User = require('../DB/db'); // db.js dosyasından User modelini içe aktarıyoruz

// POST endpoint'i: Yeni kullanıcı ekleme
router.post('/users', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // E-posta adresi zaten mevcut mu diye kontrol etme
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Yeni kullanıcı oluşturma ve veritabanına kaydetme
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET endpoint'i: Tüm kullanıcıları getirme
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
