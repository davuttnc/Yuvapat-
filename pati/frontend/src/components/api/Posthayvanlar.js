import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import defaultProfileImage from '../../images/image.png';
import poster from '../../images/blog1.png'; // Burada poster resmini import edin
import '../../css/Posthayvanlar.css';

const Posthayvanlar = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Gönderileri getirme hatası:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.put(`http://localhost:5000/posts/${postId}/like`);
      const updatedPosts = posts.map(post => {
        if (post._id === postId) {
          return { ...post, likes: response.data.post.likes };
        }
        return post;
      });
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Gönderiyi beğenme hatası:', error);
    }
  };

  return (
    <div className='Posthayvanlar'>
      <Container>    
          <Row className="align-items-center">
          <Col md={6}>
            <h5 className="arama-baslik">NEDEN BİZ</h5>
            <p className="arama-yazi">
              Patiden ile sahiplenme özelliğiyle istediğiniz köpek veya kedi cinsine yeni bir yuva sağlayabilir veya kendinize sevimli bir arkadaş edinebilirsiniz. Ayrıca tüylü dostunuzun sosyalleşmesi için eğlenceli oyun arkadaşları da bulabilirsiniz
            </p>
          </Col>
          <Col md={6} className="text-center">
          <img src={poster} alt="Poster" className="poster" /> 
          </Col>
        </Row>
        <Row xs={1} md={2} lg={3} className="g-4">
          {posts.slice(0, 5).map(post => (
            <Col key={post._id}>
              <Card className="post-card">
                <div className="profile-info">
                  {post.postedBy && post.postedBy.profilePicture ? (
                    <img
                      src={`http://localhost:5000/${post.postedBy.profilePicture}`}
                      alt="Profile"
                      className="profile-image"
                    />
                  ) : (
                    <img
                      src={defaultProfileImage}
                      alt="Profile"
                      className="profile-image"
                    />
                  )}
                  <div className="info-text">
                    <span className="username">{post.postedBy && post.postedBy.username}</span>
                  </div>
                </div>
                <span className="post-cins">{post.cins}</span>
                <Button variant="link" onClick={() => handleLike(post._id)} className="like-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-heart">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  {post.likes && post.likes.length}
                </Button>
                {post.images && post.images.length > 0 && (
                  <Card.Img variant="top" src={`http://localhost:5000/${post.images[0].path}`} className="post-image" />
                )}
                <Card.Body>
                  <Card.Text className="post-text">{post.text}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Posthayvanlar;
