import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import hayvanTurleri from '../../data/hayvanTurleri.json'; // JSON dosyasını import edin
import '../../css/PostFrom.css';

const PostForm = ({ fetchPosts }) => {
  const [cins, setCins] = useState(''); // Hayvan türü state'i
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');

  const handleCinsChange = (e) => {
    setCins(e.target.value);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      images.forEach((file) => {
        formData.append('images', file);
      });

      // Resimleri yükle
      const uploadResponse = await axios.post('http://localhost:5000/upload', formData);
      const uploadedImages = uploadResponse.data.images;

      // Gönderiyi oluştur
      const postResponse = await axios.post('http://localhost:5000/posts', { cins, text, images: uploadedImages });
      setMessage({ type: 'success', text: postResponse.data.message });
      setCins(''); // Formu sıfırla
      setText('');
      setImages([]);

    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.message || error.message || 'Bir hata oluştu. Lütfen sayfayı yenileyin .' });
    }
  };

  return (
    <div>
      <Form onSubmit={handleSubmit} className="post-form">
        <h2 className="">İlan yayınla</h2>
        <Form.Group className="mb-3">
          <Form.Control
            as="select"
            value={cins}
            onChange={handleCinsChange}
            required
          >
            <option value="">Hayvan türünü seçin</option>
            {hayvanTurleri.map((tur, index) => (
              <option key={index} value={tur}>{tur}</option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Control
            as="textarea"
            placeholder="Gönderi metni..."
            value={text}
            onChange={handleTextChange}
            rows={3}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            multiple
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Gönder
        </Button>
      </Form>
      {message && (
        <Alert variant={message.type} className="mt-3">
          {message.text}
        </Alert>
      )}
    </div>
  );
};

export default PostForm;
