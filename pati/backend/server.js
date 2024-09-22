const express = require('express');
const mongoose = require('./data/db'); // MongoDB bağlantısı
const bcrypt = require('bcryptjs');
const cors = require('cors');
const User = require('./models/User');
const Post = require('./models/Post');
const Message = require('./models/Message');
const İletisimForm = require('./models/İletisimForm');
const KayipPost = require('./models/KayipPost');
const Report = require('./models/Report');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('./middleware/auth'); // authMiddleware dosyası
const fs = require('fs');
const http = require('http'); // HTTP sunucusu oluşturmak için
const socketIo = require('socket.io'); // socket.io import edin
require('dotenv').config();


const app = express();
const server = http.createServer(app); // HTTP sunucusu oluşturun

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});
const ObjectId = mongoose.Types.ObjectId;
const PORT = 5000;
const SECRET_KEY = process.env.SECRET_KEY ;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images'))); // Statik dosya servisi


// Multer için depolama motorunu ayarla
const storage = multer.diskStorage({
  destination: './images',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 1024 * 1024 * 150 // 150 MB'ı geçmeyen dosyalar
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resimler izinlidir!'));
    }
  }
});

// Token doğrulama middleware'i
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.id; // decoded objesinden doğrulanmış kullanıcı ID'sini al
    next();
  } catch (error) {
    res.status(401).json({ message: 'Yetkisiz erişim' });
  }
}

// Kullanıcı profilini getirme
app.get('/users/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password'); // req.userId ile kullanıcıyı buluyoruz
    res.json(user);
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({ message: 'Profil getirme sırasında bir hata oluştu.' });
  }
});


// Profil resmi güncelleme
app.put('/users/me', verifyToken, upload.single('profileImage'), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const profileImage = req.file ? req.file.filename : undefined;

    const updateData = { username, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (profileImage) {
      updateData.profileImage = profileImage;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    res.json({ message: 'Kullanıcı bilgileri güncellendi.', user: updatedUser });
  } catch (error) {
    console.error('Güncelleme Hatası:', error);
    res.status(500).json({ message: 'Bir hata oluştu.' });
  }
});
// Kullanıcı profilini getirme (Token doğrulaması gerektirmeyen)
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const posts = await Post.find({ postedBy: id })
      .populate('postedBy', 'username profilePicture')
      .populate('comments.commentedBy', 'username profilePicture');

    const kayipPosts = await KayipPost.find({ postedBy: id })
      .populate('postedBy', 'username profilePicture')
      .populate('comments.commentedBy', 'username profilePicture');
    
    res.json({ user, posts, kayipPosts });
  } catch (error) {
    console.error('Kullanıcı verisi alınamadı:', error);
    res.status(500).json({ message: 'Kullanıcı verisi alınamadı.' });
  }
});


// Kullanıcının gönderilerini getirme (Token doğrulaması gerektiren)
app.get('/posts/user', verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ postedBy: req.userId })
      .populate('postedBy', 'username profileImage')  // Gönderen kullanıcı bilgilerini al
      .populate('comments.commentedBy', 'username profileImage')  // Yorum yapan kullanıcıları al
      .exec();

    res.json({ posts });
  } catch (error) {
    console.error('Gönderileri getirme hatası:', error);
    res.status(500).json({ message: 'Gönderileri getirme sırasında bir hata oluştu.' });
  }
});

app.get('/kayipPosts/user', verifyToken, async (req, res) => {
  console.log('User ID:', req.userId);  // User ID'yi kontrol et
  try {
    const lostPosts = await KayipPost.find({ postedBy: req.userId })
      .populate('postedBy', 'username profileImage')  // Gönderen kullanıcı bilgilerini al
      .populate('comments.commentedBy', 'username profileImage') 
      .exec();

    if (!lostPosts || lostPosts.length === 0) {
      return res.status(404).json({ message: 'Kayıp gönderi bulunamadı.' });
    }

    res.json({ lostPosts });
  } catch (error) {
    console.error('Kayıp gönderileri getirme hatası:', error);
    res.status(500).json({ message: 'Kayıp gönderileri getirme sırasında bir hata oluştu.' });
  }
});



// Kullanıcı kaydı
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta ile zaten kayıtlı bir kullanıcı var.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Kayıt başarılı.' });
  } catch (error) {
    console.error('Kayıt sırasında hata:', error);
    res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu.' });
  }
});

// Kullanıcı girişi
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Geçersiz şifre ve kullanıcı adı.' });
    }
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, SECRET_KEY, { expiresIn: '12h' });
    res.json({ token, isAdmin: user.isAdmin });
  } catch (error) {
    console.error('Giriş sırasında hata:', error);
    res.status(500).json({ message: 'Giriş sırasında bir hata oluştu.' });
  }
});

// Resim yükleme
app.post('/upload', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Resim yüklemesi gereklidir.' });
    }

    const images = req.files.map(file => ({ path: file.path }));
    res.status(200).json({ images });
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    res.status(500).json({ message: 'Resim yükleme sırasında bir hata oluştu.' });
  }
});

app.post('/api/iletisim', async (req, res) => {
  const { name, email, message } = req.body;
  const userId = req.userId; // Kullanıcı ID'sini alın

  try {
    // Kullanıcının son mesaj gönderim zamanını kontrol edin
    const lastMessage = await İletisimForm.findOne({ userId }).sort({ createdAt: -1 });
    const currentTime = new Date();
    if (lastMessage) {
      const lastMessageTime = new Date(lastMessage.createdAt);
      const timeDiff = (currentTime - lastMessageTime) / (1000 * 60 * 60); // Saat cinsinden fark
      if (timeDiff < 1) {
        return res.status(400).json({ message: 'Bir saat içinde sadece bir mesaj gönderebilirsiniz.' });
      }
    }

    // Yeni mesajı kaydedin
    const newİletisimForm = new İletisimForm({ name, email, message, userId });
    await newİletisimForm.save();
    res.status(201).send('Mesaj kaydedildi.');
  } catch (error) {
    console.error('Mesaj kaydetme hatası:', error);
    res.status(500).send('Mesaj kaydedilemedi.');
  }
});

// Kullanıcının son mesaj gönderim zamanını döndürme
app.get('/api/last-message-time', async (req, res) => {
  const userId = req.userId; // Kullanıcı ID'sini alın
  try {
    const lastMessage = await İletisimForm.findOne({ userId }).sort({ createdAt: -1 });
    const lastMessageTime = lastMessage ? lastMessage.createdAt : null;
    res.json({ lastMessageTime });
  } catch (error) {
    console.error('Son mesaj zamanını alırken hata:', error);
    res.status(500).json({ message: 'Zaman bilgisi alınamadı.' });
  }
});

app.post('/api/:postId/report', verifyToken, async (req, res) => {
  const { postId } = req.params;
  const { reason } = req.body;

  try {
    const existingReport = await Report.findOne({ postId, reportedBy: req.userId });
    if (existingReport) {
      return res.status(400).json({ message: 'Bu gönderiyi zaten şikayet ettiniz.' });
    }

    const newReport = new Report({
      postId: postId,
      reason: reason,
      reportedBy: req.userId
    });

    await newReport.save();
    res.status(201).json({ message: 'Şikayet başarıyla gönderildi' });
  } catch (error) {
    console.error('Şikayet gönderme hatası:', error); // Hata loglama
    res.status(500).json({ message: 'Şikayet gönderilemedi' });
  }
});


// Tüm gönderileri getirme (Token doğrulaması gerektirmeyen)
app.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Sayfa ve limit parametrelerini al, varsayılan olarak page=1 ve limit=10
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('postedBy', 'username profileImage')  // Gönderen kullanıcı bilgilerini al
      .populate('comments.commentedBy', 'username profileImage')  // Yorum yapan kullanıcıları al
      .limit(limit * 1) // Kaç tane gönderi alınacağını belirle
      .skip((page - 1) * limit) // Hangi sayfanın verilerinin alınacağını belirle
      .exec();

    const count = await Post.countDocuments(); // Toplam gönderi sayısını al

    // Kullanıcı bilgisi eksik olan gönderileri filtreleyin
    const validPosts = posts.filter(post => post.postedBy && post.postedBy.username);

    res.json({
      posts: validPosts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Gönderileri getirme hatası:', error);
    res.status(500).json({ message: 'Gönderileri getirme sırasında bir hata oluştu.' });
  }
});

// Kayıp gönderileri getirme (Token doğrulaması gerektirmeyen)
app.get('/kayipPosts', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; 
    const kayipPosts = await KayipPost.find()
      .sort({ createdAt: -1 })
      .populate('postedBy', 'username profileImage')  // Gönderen kullanıcı bilgilerini al
      .populate('comments.commentedBy', 'username profileImage')  // Yorum yapan kullanıcıları al
      .limit(parseInt(limit)) // Kaç tane gönderi alınacağını belirle
      .skip((page - 1) * limit) // Hangi sayfanın verilerinin alınacağını belirle
      .exec();

    const count = await KayipPost.countDocuments(); // Toplam gönderi sayısını al

    res.json({
      kayipPosts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Kayıp gönderileri getirme hatası:', error);
    res.status(500).json({ message: 'Kayıp gönderileri getirme sırasında bir hata oluştu.' });
  }
});

// gönderi oluşturma
app.post('/posts', verifyToken, async (req, res) => {
  const { cins, text, images } = req.body;

  try {
    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'Resim yüklemesi gereklidir.' });
    }

    const postedBy = req.userId;
    const newPost = new Post({ cins, text, images, postedBy });
    await newPost.save();
    res.status(201).json({ message: 'başarıyla oluşturuldu litfen sayayı yenileyin.', post: newPost });
  } catch (error) {
    console.error('gönderi oluşturma hatası:', error);
    res.status(500).json({ message: 'önderi oluşturma sırasında bir hata oluştu.' });
  }
});
// Gönderi beğenme
app.put('/posts/:postId/like', verifyToken, async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı.' });
    }

    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Bu gönderiyi zaten beğendiniz.' });
    }

    post.likes.push(userId);
    await post.save();
    res.json({ message: 'Gönderi başarıyla beğenildi.', post });
  } catch (error) {
    console.error('Gönderiyi beğenme hatası:', error);
    res.status(500).json({ message: 'Gönderiyi beğenme sırasında bir hata oluştu.' });
  }
});

// Yoruma gönderi ekle
app.post('/posts/:postId/comment', verifyToken, async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  const commentedBy = req.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı.' });
    }

    post.comments.push({ text, commentedBy });
    await post.save();
    res.json({ message: 'Yorum başarıyla eklendi.', post });
  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    res.status(500).json({ message: 'Yorum ekleme sırasında bir hata oluştu.' });
  }
});

// Kayıp gönderi oluşturma
app.post('/kayipPosts', verifyToken, async (req, res) => {
  const { konum, text, images } = req.body;

  try {
    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'Resim yüklemesi gereklidir.' });
    }

    const postedBy = req.userId;
    const newKayipPost = new KayipPost({ konum, text, images, postedBy });
    await newKayipPost.save();
    res.status(201).json({ message: 'başarıyla oluşturuldu litfen sayayı yenileyin.', post: newKayipPost });
  } catch (error) {
    console.error('Kayıp gönderi oluşturma hatası:', error);
    res.status(500).json({ message: 'Kayıp gönderi oluşturma sırasında bir hata oluştu.' });
  }
});


// Kayıp Gönderi beğenme
app.put('/KayipPosts/:KayipPostId/like', verifyToken, async (req, res) => {
  const { KayipPostId } = req.params;
  const userId = req.userId;

  try {
    const kayipPost = await KayipPost.findById(KayipPostId);
    if (!kayipPost) {
      return res.status(404).json({ message: 'Gönderi bulunamadı.' });
    }

    if (kayipPost.likes.includes(userId)) {
      return res.status(400).json({ message: 'Bu gönderiyi zaten beğendiniz.' });
    }

    kayipPost.likes.push(userId);
    await kayipPost.save();
    res.json({ message: 'Gönderi başarıyla beğenildi.', kayipPost });
  } catch (error) {
    console.error('Gönderiyi beğenme hatası:', error);
    res.status(500).json({ message: 'Gönderiyi beğenme sırasında bir hata oluştu.' });
  }
});

// Yorum ekleme
app.post('/KayipPosts/:KayipPostId/comment', verifyToken, async (req, res) => {
  const { KayipPostId } = req.params;
  const { text } = req.body;
  const commentedBy = req.userId;

  try {
    const kayipPost = await KayipPost.findById(KayipPostId);
    if (!kayipPost) {
      return res.status(404).json({ message: 'Gönderi bulunamadı.' });
    }

    kayipPost.comments.push({ text, commentedBy });
    await kayipPost.save();
    res.json({ message: 'Yorum başarıyla eklendi.', kayipPost });
  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    res.status(500).json({ message: 'Yorum ekleme sırasında bir hata oluştu.' });
  }
});


// Kullanıcının tüm mesajlarını getirme
app.get('/messages/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Kullanıcının tüm mesajlarını alın
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ timestamp: -1 });

    // Kullanıcı ID'lerini toplayın
    const userIds = Array.from(new Set(
      messages.flatMap(message => [message.senderId, message.receiverId])
    ));

    // Kullanıcı bilgilerini almak için bir API çağrısı yapın
    const users = await User.find({ _id: { $in: userIds } });

    // Kullanıcı bilgilerini bir harita olarak saklayın
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user;
      return acc;
    }, {});

    // Mesajları gruplayın ve en son mesajları seçin
    const groupedMessages = messages.reduce((acc, message) => {
      const roomId = message.roomId;
      if (!acc[roomId]) {
        acc[roomId] = {
          participants: [message.senderId, message.receiverId],
          lastMessageSender: message.senderId,
          lastMessage: message.content,
          roomId,
          lastMessageTimestamp: message.timestamp
        };
      } else {
        acc[roomId].lastMessage = message.content;
        acc[roomId].lastMessageTimestamp = message.timestamp;
        acc[roomId].lastMessageSender = message.senderId;
      }
      return acc;
    }, {});

    // Katılımcıların isimlerini ekleyin
    const conversationDetails = Object.values(groupedMessages).map(convo => ({
      ...convo,
      participantsUsernames: convo.participants.map(id => userMap[id]?.username || 'Bilinmiyor')
    }));

    res.json(conversationDetails);
  } catch (error) {
    console.error('Mesajları getirme hatası:', error);
    res.status(500).json({ message: 'Mesajları getirme sırasında bir hata oluştu.' });
  }
});


app.get('/messages/:roomId', async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Mesajları getirme hatası:', error);
    res.status(500).json({ message: 'Mesajları getirme sırasında bir hata oluştu.' });
  }
});


app.post('/messages', async (req, res) => {
  const { roomId, senderId, receiverId, content, timestamp } = req.body;

  if (!roomId || !senderId || !receiverId || !content || !timestamp) {
    return res.status(400).json({ message: 'Eksik alanlar mevcut.' });
  }

  try {
    const newMessage = new Message({
      roomId,
      senderId,
      receiverId,
      content,
      timestamp
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Mesaj kaydetme hatası:', error);
    res.status(500).json({ message: 'Mesaj kaydetme sırasında bir hata oluştu.' });
  }
});



io.on('connection', (socket) => {
  // Odaya katılma
  socket.on('joinRoom', (data) => {
    socket.join(data.roomId);
   
  });
  // Mesaj gönderildiğinde
  socket.on('sendMessage', (message) => {
    io.to(message.roomId).emit('receiveMessage', message); // Mesajı sadece o odadaki kullanıcılara gönder
  });

  // Kullanıcı bağlantısını keserse
  socket.on('disconnect', () => {});
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

