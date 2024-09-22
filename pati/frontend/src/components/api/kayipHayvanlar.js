import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
import defaultProfileImage from '../../images/image.png';
import posterImage from '../../images/blog.png'; // Görüntüyü içe aktarın
import '../../css/KayipHayvanlar.css'; // CSS dosyanızın adını buraya göre güncelleyin
import { Link } from 'react-router-dom';

const KayipHayvanlar = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await axios.get('http://localhost:5000/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Kullanıcı bilgilerini getirme hatası:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/KayipPosts');
      setPosts(response.data);
    } catch (error) {
      console.error('Kayıp gönderileri getirme hatası:', error);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            } else {
              entry.target.classList.remove('visible');
            }
          });
        },
        {
          threshold: 0.1,
        }
      );

      const elements = containerRef.current.querySelectorAll('.hayvan-card, .poster-container');
      elements.forEach((element) => {
        observer.observe(element);
      });

      return () => {
        elements.forEach((element) => {
          observer.unobserve(element);
        });
      };
    }
  }, [posts]);

  return (
    <div className=" py-6 kayip-hayvanlar">
      <Container ref={containerRef}>
        <Row>
          <Col xs={12} md={4} className="poster-container">
            <img src={posterImage} alt="Poster" className="poster" />
          </Col>
          <Col xs={12} md={8}>
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <div
                  key={post._id}
                  className={`hayvan-card mb-4 ${index % 2 === 0 ? 'animate-left' : 'animate-right'}`}
                >
                  <Row>
                    <Col xs={3}>
                      <div className="paylasan-kisi">
                        <img
                          src={post.postedBy && post.postedBy.profilePicture ? `http://localhost:5000/${post.postedBy.profilePicture}` : defaultProfileImage}
                          alt="Profil Resmi"
                          className="paylasan-profil-resmi"
                        />
                        <span className="paylasan-adi">{post.postedBy && post.postedBy.username}</span>
                      </div>
                      <div className="hayvan-resim-container">
                        {post.images && post.images.length > 0 ? (
                          <img
                            src={`http://localhost:5000/${post.images[0].path}`}
                            alt="Hayvan Resmi"
                            className="hayvan-resim"
                          />
                        ) : (
                          <img
                            src={defaultProfileImage}
                            alt="Varsayılan Hayvan Resmi"
                            className="hayvan-resim"
                          />
                        )}
                      </div>
                    </Col>
                    <Col xs={8}>
                      <div className="hayvan-text">
                        <div className="hayvan-metin">{post.text}</div>
                      </div>
                      <h6 className='konum'>{post.konum}</h6>
                      <div className="daha-fazla-bilgi">
                        <Link to="/Kayipİlan">Daha fazla bilgi için tıklayınız</Link>
                      </div>
                    </Col>
                  </Row>
                </div>
              ))
            ) : (
              <div>Gösterilecek veri yok.</div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default KayipHayvanlar;
