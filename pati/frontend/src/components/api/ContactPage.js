import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { Row, Col, Form, Button } from 'react-bootstrap';
import kittyImage from '../../images/iletşim.png';
import '../../css/AnaSayfa.css';
import { useAuth } from '../../context/AuthContext';

const ContactPage = () => {
  const { user } = useAuth(); // AuthContext üzerinden kullanıcı bilgisini al
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email || ''); // Kullanıcının e-posta adresini form alanına otomatik olarak yerleştir
      setName(user.name || ''); // Kullanıcının adını form alanına otomatik olarak yerleştir
    }
  }, [user]);

  const handleSubmit = async (e) => { 
    e.preventDefault(); 

    if (!user) {
      setError('Giriş yapmadınız. Mesaj gönderemezsiniz.');
      return;
    }

    try {
      // Kullanıcının son mesaj gönderim zamanını kontrol et
      const response = await axios.get('http://localhost:5000/api/last-message-time');
      const lastMessageTime = new Date(response.data.lastMessageTime);
      const currentTime = new Date();
      const timeDiff = (currentTime - lastMessageTime) / (1000 * 60 * 60); // Saat cinsinden fark

      if (timeDiff < 1) {
        setError('Bir saat içinde sadece bir mesaj gönderebilirsiniz.');
        return;
      }

      // Mesajı gönder
      await axios.post('http://localhost:5000/api/iletisim', { name, email, message });
      alert('Mesajınız başarıyla gönderildi.');
      setName(''); 
      setEmail(user.email || ''); // E-posta adresini yeniden otomatik olarak ayarla
      setMessage(''); 
      setError('');
    } catch (error) {
      console.error('Hata:', error);
      setError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  return (
    <Row>
      <Col md={6}>
        <div className="contact-form">
          <h2>İletişim Formu</h2>
          {error && <p className="error">{error}</p>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3 pati-form" controlId="formName">
              <Form.Label>Ad Soyad</Form.Label>
              <Form.Control
                className="input"
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)} 
                placeholder="Adınız ve Soyadınız"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email Adresi</Form.Label>
              <Form.Control
                className="input"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email adresiniz"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formMessage">
              <Form.Label>Mesajınız</Form.Label>
              <Form.Control
                className="input"
                as="textarea"
                rows={3}
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mesajınızı buraya yazın"
              />
            </Form.Group>
            <Button className="btn" type="submit">
              Gönder
            </Button>
          </Form>
        </div>
      </Col>
      <Col md={6}>
        <div className="kitty-image">
          <img src={kittyImage} alt="Kedi Resmi" />
        </div>
      </Col>
    </Row>
  );
};

export default ContactPage;
