import React, { useState } from 'react'; 
import axios from 'axios'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const RegisterForm = () => { // RegisterForm bileşenini tanımlıyoruz.
  const [username, setUsername] = useState(''); // Kullanıcı adını saklamak için state oluşturuyoruz.
  const [email, setEmail] = useState(''); // E-posta adresini saklamak için state oluşturuyoruz.
  const [password, setPassword] = useState(''); // Şifreyi saklamak için state oluşturuyoruz.
  const [message, setMessage] = useState(''); // Kullanıcıya mesaj göstermek için state oluşturuyoruz.

  const handleSubmit = async (e) => { // Form gönderildiğinde çağrılacak fonksiyon.
    e.preventDefault(); // Formun varsayılan davranışını (sayfanın yenilenmesini) engelliyoruz.
    try {
      // API'ye kayıt isteği gönderiyoruz.
      const response = await axios.post('http://localhost:5000/register', { username, email, password });
      setMessage(response.data.message); // Başarılı yanıt durumunda mesajı güncelliyoruz.
    } catch (error) {
      // Hata durumunda mesajı güncelliyoruz.
      setMessage(error.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div style={{ maxWidth: '38rem' }} className="container mt-5">
      <h2 className="text-center">Kayıt Ol</h2>
      <form onSubmit={handleSubmit}> {/* Form elemanı, gönderildiğinde handleSubmit çağrılır */}
        <div className="mb-3"> 
          <input type="text" className="form-control" placeholder="Kullanıcı Adı" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="mb-3"> 
          <input type="email" className="form-control" placeholder="E-posta Adresi" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <input type="password" className="form-control" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary w-100">Kayıt Ol</button> 
      </form>
      {message && <p className="text-danger text-center mt-3">{message}</p>}
    </div>
  );
};

export default RegisterForm; 
