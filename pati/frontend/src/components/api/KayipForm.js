import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import turkishCities from '../../data/turkishCities.json'; // JSON dosyasını import edin
import '../../css/PostFrom.css';

const PostForm = ({ fetchPosts }) => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    // Şehir verilerini yükle
    setCities(turkishCities);
  }, []);

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    setSelectedDistrict(''); // Seçili ilçeyi sıfırla
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
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
      // Resimleri yüklemek için formData oluşturuyoruz
      const formData = new FormData();
      images.forEach((file) => {
        formData.append('images', file);
      });

      // Resimleri yükledikten sonra
      const uploadResponse = await axios.post('http://localhost:5000/upload', formData);
      const uploadedImages = uploadResponse.data.images;

      // Şehir ve ilçeyi tek bir string olarak birleştiriyoruz
      const fullLocation = `${selectedCity} - ${selectedDistrict}`;

      // Yeni gönderiyi oluşturuyoruz
      const postResponse = await axios.post('http://localhost:5000/KayipPosts', { 
        konum: fullLocation, 
        text, 
        images: uploadedImages 
      });
      setMessage({ type: 'success', text: postResponse.data.message });
      setSelectedCity('');
      setSelectedDistrict('');
      setText('');
      setImages([]);
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    }
  };

  return (
    <div className="">
      <Form onSubmit={handleSubmit} className="post-form">
        <h2 className="">Kayıp İlanı Yayınla</h2>
        <Form.Group className="mb-3">
          <Form.Control
            as="select"
            value={selectedCity}
            onChange={handleCityChange}
            required
          >
            <option value="">Şehir seçin</option>
            {cities.map((cityObj, index) => (
              <option key={index} value={cityObj.city}>{cityObj.city}</option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Control
            as="select"
            value={selectedDistrict}
            onChange={handleDistrictChange}
            required
            disabled={!selectedCity} // Şehir seçilmediyse ilçeler seçilemez
          >
            <option value="">İlçe seçin</option>
            {selectedCity && turkishCities.find(c => c.city === selectedCity)?.districts.map((district, index) => (
              <option key={index} value={district}>{district}</option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Control
            as="textarea"
            placeholder="Gönderi metni"
            rows={3}
            value={text}
            onChange={handleTextChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Control
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Gönderi Yap
        </Button>
        {message && (
          <Alert variant={message.type} className="mt-3">
            {message.text}
          </Alert>
        )}
      </Form>
    </div>
  );
};

export default PostForm;
