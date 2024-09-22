import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // login fonksiyonunu kullanın

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Giriş için API çağrısı
      const response = await axios.post('http://localhost:5000/login', { email, password });
      const { token } = response.data;

      // Token'ı sessionStorage'a kaydet
      sessionStorage.setItem('token', token);

      // Kullanıcı bilgilerini al
      const userResponse = await axios.get('http://localhost:5000/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = userResponse.data;

      // Kullanıcı bilgisini güncelle
      login(userData);
      setMessage('Giriş başarılı!');

      // Kullanıcının rolüne göre yönlendirme
      if (userData.isAdmin) {
        window.location.href = `http://localhost:9000/`; // Admin paneline yönlendir (4000 portu örnek)
      } else {
        navigate('/'); // Anasayfaya yönlendir
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div style={{ maxWidth: '38rem' }} className="container mt-5">
      <h2 className="text-center">Giriş Yap</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input 
            type="email" 
            className="form-control" 
            placeholder="E-posta Adresi" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="mb-3">
          <input 
            type="password" 
            className="form-control" 
            placeholder="Şifre" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn btn-success w-100">Giriş Yap</button>
      </form>
      {message && <p className="text-danger text-center mt-3">{message}</p>}
    </div>
  );
};

export default LoginForm;
