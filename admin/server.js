const express = require('express');
const mongoose = require('./data/db'); // MongoDB bağlantısı

const bcrypt = require('bcrypt');
const cors = require('cors');
const User = require('./models/User'); 
const Post = require('./models/Post');
const KayipPost = require('./models/KayipPost');
const IletisimForm = require('./models/İletisimForm');
const Report = require('./models/Report');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 9000;
const saltRounds = 10; 
// EJS şablon motorunu ayarla
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Şablon dosyalarının bulunduğu dizin
app.use(express.static(path.join(__dirname, 'public')));
// Multer için depolama motorunu ayarla
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../pati/backend/images'),
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


app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, '../pati/backend/images')));

// Ana sayfa
app.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Şifreyi hariç tut
    res.render('panel');
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    res.status(500).send('Kullanıcıları getirme sırasında bir hata oluştu.');
  }
});
// Express.js örneği
app.get('/api/users/count', async (req, res) => {
  try {
      const count = await User.countDocuments();
      res.json({ count });
  } catch (error) {
      console.error('Kullanıcı sayısı alınırken hata:', error);
      res.status(500).json({ message: 'Kullanıcı sayısı alınırken bir hata oluştu.' });
  }
});
app.get('/api/form/count', async (req, res) => {
  try {
      const count = await IletisimForm.countDocuments();
      res.json({ count });
  } catch (error) {
      console.error('mesajlar sayısı alınırken hata:', error);
      res.status(500).json({ message: 'mesajlar sayısı alınırken bir hata oluştu.' });
  }
});
app.get('/api/Sikayet/count', async (req, res) => {
  try {
      const count = await Report.countDocuments();
      res.json({ count });
  } catch (error) {
      console.error('mesajlar sayısı alınırken hata:', error);
      res.status(500).json({ message: 'mesajlar sayısı alınırken bir hata oluştu.' });
  }
});

// Admin profilini gösterme
app.get('/adminProfile', async (req, res) => {
  try {
    // Veritabanında admin kullanıcıyı bul
    const admin = await User.findOne({ isAdmin: true }).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Admin kullanıcısı bulunamadı.' });
    }

    // Admin profil sayfasını render et
    res.render('adminProfile', { admin });
  } catch (error) {
    console.error('Admin bilgilerini getirme hatası:', error);
    res.status(500).json({ message: 'Admin bilgilerini getirme sırasında bir hata oluştu.' });
  }
});

// Admin profilini güncelleme
app.post('/adminProfile', upload.single('profileImage'), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let updateData = { username, email };

    // Şifreyi hashleme (varsa)
    if (password) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password = hashedPassword;
    }

    // Profil resmini güncelleme (varsa)
    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    // Admin kullanıcısını bul ve güncelle
    const updatedAdmin = await User.findOneAndUpdate(
      { isAdmin: true },
      updateData,
      { new: true, runValidators: true } // Güncellenmiş kullanıcıyı döndür ve validasyonları çalıştır
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin kullanıcısı bulunamadı.' });
    }

    res.redirect('/adminProfile');
  } catch (error) {
    console.error('Admin bilgilerini güncelleme hatası:', error);
    res.status(500).json({ message: 'Admin bilgilerini güncellerken bir hata oluştu.' });
  }
});

// Kullanıcıları getirme
app.get('/users', async (req, res) => {
  try {
    const users = await User.find()
    .select('-password')
    .sort({ _id: -1  }); 
    ; 
    res.render('user', { users }); // EJS şablonunu kullanarak render et
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    res.status(500).json({ message: 'Kullanıcıları getirme sırasında bir hata oluştu.' });
  }
});

app.get('/IletisimForms' , async (req,res) =>{
  try{
    const IletisimForms = await IletisimForm.find()
    .sort({ _id: -1  });
    res.render('IletisimForm', { IletisimForms });
  }catch (error){
    console.error('mesajları getirme hatası:', error);
  }
});

app.get('/Sikayetler', async (req, res) => {
  try {
    const Sikayetler = await Report.find()
      .populate('reportedBy', 'username')
      .populate({
        path: 'postId',
        select: 'images' // Gönderiye ait resimleri alıyoruz
      })
      .sort({ _id: -1 });

    res.render('Sikayetler', { Sikayetler });
  } catch (error) {
    console.error('Şikayetleri getirme hatası:', error);
    res.status(500).send('Bir hata oluştu');
  }
});

app.delete('/Sikayetler/:id', async (req, res) => {
  const SikayetlerId = req.params.id;

  try {
    const deletedForm = await Report.findByIdAndDelete(SikayetlerId);

    if (!deletedForm) {
      return res.status(404).json({ message: 'Mesaj bulunamadı.' });
    }

    res.json({ message: 'Mesaj başarıyla silindi.' });
  } catch (error) {
    console.error('Silme hatası:', error);
    res.status(500).json({ message: 'Mesajı silerken bir hata oluştu.' });
  }
});

app.delete('/IletisimForms/:id', async (req, res) => {
  const IletisimFormsId = req.params.id;

  try {
    const deletedForm = await IletisimForm.findByIdAndDelete(IletisimFormsId);

    if (!deletedForm) {
      return res.status(404).json({ message: 'Mesaj bulunamadı.' });
    }

    res.json({ message: 'Mesaj başarıyla silindi.' });
  } catch (error) {
    console.error('Silme hatası:', error);
    res.status(500).json({ message: 'Mesajı silerken bir hata oluştu.' });
  }
});

// Kullanıcı silme
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    // Kullanıcıyı sil
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Kullanıcının gönderilerini sil
    await Post.deleteMany({ postedBy: userId });
    // Kayıp gönderileri sil
    await KayipPost.deleteMany({ postedBy: userId });

    // Kullanıcıyı sil
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Kullanıcı ve ona ait gönderiler başarıyla silindi.' });
  } catch (error) {
    console.error('Kullanıcıyı silme hatası:', error);
    res.status(500).json({ message: 'Kullanıcıyı silerken bir hata oluştu.' });
  }
});


app.post('/users/:id', upload.single('profileImage'), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const updateData = { username, email };

    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password = hashedPassword;
    }

    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } // Güncellenmiş kullanıcıyı döndür ve validasyonları çalıştır
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    res.redirect('/users');
  } catch (error) {
    console.error('Kullanıcıyı güncelleme hatası:', error);
    res.status(500).json({ message: 'Kullanıcıyı güncellerken bir hata oluştu.' });
  }
});

app.get('/HayvanSahiplenirme', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('postedBy', 'username') // Gönderiyi paylaşan kullanıcının adını al
      .populate('likes', 'username') // Gönderiyi beğenen kullanıcıların adını al
      .sort({ createdAt: -1 }); // En son gönderiyi en üstte göster
   
    res.render('HayvanSahiplenirme', { posts });
  } catch (error) {
    console.error('Gönderileri getirme hatası:', error);
    res.status(500).send('Gönderileri getirme sırasında bir hata oluştu.');
  }
});

// Silme işlemi için API uç noktası
app.delete('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const result = await Post.findByIdAndDelete(postId);
    
    if (result) {
      res.status(200).json({ message: 'Gönderi başarıyla silindi.' });
    } else {
      res.status(404).json({ message: 'Gönderi bulunamadı.' });
    }
  } catch (error) {
    console.error('Gönderi silme hatası:', error);
    res.status(500).send('Gönderiyi silme sırasında bir hata oluştu.');
  }
});

app.delete('/posts/:postId/likes/:likeId', async (req, res) => {
  const { postId, likeId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Gönderi bulunamadı.' });

    post.likes.pull(likeId);
    await post.save();
    res.json({ message: 'Beğeni başarıyla silindi.' });
  } catch (err) {
    console.error('Beğeni silme hatası:', err);
    res.status(500).json({ message: 'Beğeni silinirken bir hata oluştu.' });
  }
});

app.delete('/posts/:postId/comments/:commentId', async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Gönderi bulunamadı.' });

    post.comments.id(commentId).remove();
    await post.save();
    res.json({ message: 'Yorum başarıyla silindi.' });
  } catch (err) {
    console.error('Yorum silme hatası:', err);
    res.status(500).json({ message: 'Yorum silinirken bir hata oluştu.' });
  }
});


app.get('/KayipHayvanlar', async (req, res) => {
  try {
    const kayipPosts = await KayipPost.find()
      .populate('postedBy', 'username') // Gönderiyi paylaşan kullanıcının adını al
      .populate('likes', 'username') // Gönderiyi beğenen kullanıcıların adını al
      .sort({ createdAt: -1 }); // En son gönderiyi en üstte göster
   
    res.render('KayipHayvanlar', { kayipPosts });
  } catch (error) {
    console.error('Gönderileri getirme hatası:', error);
    res.status(500).send('Gönderileri getirme sırasında bir hata oluştu.');
  }
});

app.delete('/kayipPosts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const result = await KayipPost.findByIdAndDelete(postId);
    
    if (result) {
      res.status(200).json({ message: 'Gönderi başarıyla silindi.' });
    } else {
      res.status(404).json({ message: 'Gönderi bulunamadı.' });
    }
  } catch (error) {
    console.error('Gönderi silme hatası:', error);
    res.status(500).send('Gönderiyi silme sırasında bir hata oluştu.');
  }
});

app.delete('/kayipPosts/:postId/likes/:likeId', async (req, res) => {
  const { postId, likeId } = req.params;

  try {
    const post = await KayipPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Gönderi bulunamadı.' });

    post.likes.pull(likeId);
    await post.save(); // `KayipPost.save()` yerine `post.save()` kullanılmalı
    res.json({ message: 'Beğeni başarıyla silindi.' });
  } catch (err) {
    console.error('Beğeni silme hatası:', err);
    res.status(500).json({ message: 'Beğeni silinirken bir hata oluştu.' });
  }
});
app.delete('/kayipPosts/:postId/comments/:commentId', async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    const post = await KayipPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Gönderi bulunamadı.' });

    post.comments.id(commentId).remove();
    await post.save(); // `KayipPost.save()` yerine `post.save()` kullanılmalı
    res.json({ message: 'Yorum başarıyla silindi.' });
  } catch (err) {
    console.error('Yorum silme hatası:', err);
    res.status(500).json({ message: 'Yorum silinirken bir hata oluştu.' });
  }
});


app.post('/logout', async (req, res) => {
  const { token } = req.body;

  try {
    // Başka bir sunucudan token'ı doğrulama ve çıkış yapma
    const response = await axios.post('http://localhost:5000/users/me', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Çıkış yapma işlemi başarılı ise
    if (response.status === 200) {
      res.json({ message: 'Çıkış başarılı.' });
    } else {
      res.status(response.status).json({ message: 'Çıkış yapma sırasında bir hata oluştu.' });
    }
  } catch (error) {
    console.error('Çıkış sırasında hata:', error);
    res.status(500).json({ message: 'Çıkış sırasında bir hata oluştu.' });
  }
});


app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
