const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming this is your User model
const SECRET_KEY = process.env.SECRET_KEY || 'Patika16'; // Fallback to a default secret key if not provided in environment

const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Authorization başlığından token'ı al


  try {
    const decoded = jwt.verify(token, SECRET_KEY); // Token'ı doğrula
    const user = await User.findById(decoded.id).select('-password'); // Kullanıcıyı bul


    req.user = user; // Kullanıcıyı isteğe ekle
    next(); // Bir sonraki middleware'e veya yönlendiriciye geç
  } catch (error) {

  }
};



module.exports = authMiddleware;
