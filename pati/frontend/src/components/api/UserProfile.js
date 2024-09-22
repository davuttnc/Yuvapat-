import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form, Container, Row, Col } from 'react-bootstrap';
import defaultProfileImage from '../../images/image.png';
import arkaplan from '../../images/yuvapat.png';
import '../../css/UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [lostPosts, setLostPosts] = useState([]);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    profileImage: null
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setFormData({
          username: response.data.username,
          email: response.data.email,
          password: '',
          profileImage: null
        });

        const postsResponse = await axios.get('http://localhost:5000/posts/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(postsResponse.data.posts || []);

        const lostPostsResponse = await axios.get('http://localhost:5000/kayipPosts/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLostPosts(lostPostsResponse.data.lostPosts || []);

      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
        setMessage('Kullanıcı bilgileri alınamadı.');
      }
    };

    fetchUserData();
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'profileImage') {
      setFormData({
        ...formData,
        profileImage: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formDataToSend = new FormData();
  
    formDataToSend.append('username', formData.username);
    formDataToSend.append('email', formData.email);
    if (formData.password) {
      formDataToSend.append('password', formData.password);
    }
    if (formData.profileImage) {
      formDataToSend.append('profileImage', formData.profileImage);
    }
  
    try {
      const response = await axios.put('http://localhost:5000/users/me', formDataToSend, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Response:', response.data);
      setMessage('Bilgiler başarıyla güncellendi.');
      setUser(response.data.user);
      handleCloseModal();
    } catch (error) {
      console.error('Güncelleme Hatası:', error);
      setMessage('Bilgiler güncellenirken bir hata oluştu.');
    }
  };

  if (!user) {
    return <p>Yükleniyor...</p>;
  }

  return (
    <Container fluid className="user-profile-container">
      <Row>
        <Col md={12} className="profile-header">
          <div className="profile-header-background">
            <img
              src={arkaplan}
              alt="Profil Arka Plan"
              className="background-image"
            />
          </div>
        </Col>
      </Row>
      <Row className="profile-info-container">
        <Col md={4} className="profile-image-container">
          <img
            src={user.profileImage ? `http://localhost:5000/images/${user.profileImage}` : defaultProfileImage }
            alt="Profil"
            className="profile-image"
          />
        </Col>
        <Col md={4} className="profile-details-container">
          <h1 className="username">{user.username}</h1>
          <p className="email">{user.email}</p>
        </Col>
        <Col md={4} className="profile-button-container">
          <Button variant="primary" onClick={handleShowModal} className="update-button">
            Bilgileri Güncelle
          </Button>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <h3>Paylaşımlar</h3>
          <Row>
            {Array.isArray(posts) && posts.length ? posts.map(post => (
              <Col md={4} key={post._id} className="mb-4">
                <div className="post-card">
                  <img src={`http://localhost:5000/${post.images[0]?.path}`} alt="Post" className="post-image" />
                  <p>{post.text}</p>
                </div>
              </Col>
            )) : <p>Henüz paylaşımınız yok.</p>}
          </Row>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <h3>Kayıp İlanlarınız</h3>
          <Row>
            {Array.isArray(lostPosts) && lostPosts.length ? lostPosts.map(post => (
              <Col md={4} key={post._id} className="mb-4">
                <div className="post-card">
                  <img src={`http://localhost:5000/${post.images[0]?.path}`} alt="Kayıp Post" className="lost-post-image" />
                  <p>{post.text}</p>
                </div>
              </Col>
            )) : <p>Henüz kayıp ilanınız yok.</p>}
          </Row>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Bilgileri Güncelle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="username">
              <Form.Label>Ad</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="email">
              <Form.Label>E-posta</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="password">
              <Form.Label>Şifre</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="profileImage">
              <Form.Label>Profil Resmi</Form.Label>
              <Form.Control
                type="file"
                name="profileImage"
                onChange={handleChange}
                accept="image/*"
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3">
              Güncelle
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {message && <p className="text-center mt-3">{message}</p>}
    </Container>
  );
};

export default UserProfile;
