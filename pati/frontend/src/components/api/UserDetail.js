import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom'; 
import defaultProfileImage from '../../images/image.png';
import arkaplan from '../../images/yuvapat.png';
import '../../css/UserDetail.css';

const UserDetail = () => {
  const { id } = useParams(); 
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [kayipPosts, setKayipPosts] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/users/${id}`);
        setUser(response.data.user);
        setPosts(response.data.posts);
        setKayipPosts(response.data.kayipPosts);

        const token = sessionStorage.getItem('token');
        if (token) {
          try {
            const authResponse = await axios.get('http://localhost:5000/users/me', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (authResponse.status === 200) {
              setIsLoggedIn(true);
            }
          } catch (authError) {
            console.error('Token doğrulama hatası:', authError);
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        console.error('Veri alma hatası:', error);
        setMessage('Kullanıcı bilgileri alınamadı.');
      }
    };

    fetchUserData();
  }, [id]);

  const handleMessageClick = () => {
    if (user?._id) {
      navigate(`/chat/${user._id}`);
    }
  }

  if (message) {
    return <p>{message}</p>;
  }

  if (!user) {
    return <p>Yükleniyor...</p>;
  }

  return (
    <Container fluid className="user-detail-container">
      <Row>
        <Col md={12} className="profile-header">
          <div className="profile-header-background">
            <img src={arkaplan} alt="Profil Arka Plan" className="background-image" />
          </div>
        </Col>
      </Row>
      <Row className="profile-info-container">
        <Col md={4} className="profile-image-container">
          <img
            src={user.profileImage ? `http://localhost:5000/images/${user.profileImage}` : defaultProfileImage}
            alt="Profil"
            className="profile-image"
          />
        </Col>
        <Col md={4} className="profile-details-container">
          <h1 className="username">{user.username}</h1>
          <p className="email">{user.email}</p>
        </Col>
        <Col md={4} className="profile-button-container">
          {isLoggedIn ? (
            <Button variant="primary" onClick={handleMessageClick}>
              Mesaj Gönder
            </Button>
          ) : (
            <p>Mesaj atmak için giriş yapın.</p>
          )}
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <h3>Sahiplendirilecek</h3>
          <Row>
            {posts.length ? posts.map(post => (
              <Col md={4} key={post._id} className="mb-4">
                <div className="post-card">
                  <img src={`http://localhost:5000/${post.images[0]?.path}`} alt="Post" className="post-image" />
                  <p>{post.text}</p>
                </div>
              </Col>
            )) : <p>Henüz paylaşım yok.</p>}
          </Row>
          <h3>Kayıp İlanları</h3>
          <Row>
            {kayipPosts.length ? kayipPosts.map(post => (
              <Col md={4} key={post._id} className="mb-4">
                <div className="post-card">
                  <img src={`http://localhost:5000/${post.images[0]?.path}`} alt="Post" className="post-image" />
                  <p>{post.text}</p>
                </div>
              </Col>
            )) : <p>Henüz kayıp ilanı yok.</p>}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDetail;
