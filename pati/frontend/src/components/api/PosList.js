import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Row, Col, Form ,Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // AuthContext'i içe aktar
import defaultProfileImage from '../../images/image.png'; // Varsayılan profil resmi
import '../../css/PostList.css';

const PostCard = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [animalType, setAnimalType] = useState('');
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useAuth(); // Giriş yapmış kullanıcı bilgileri
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (animalType) {
      const lowercasedType = animalType.toLowerCase();
      setFilteredPosts(posts.filter(post =>
        post.cins?.toLowerCase().startsWith(lowercasedType)
      ));
    } else {
      setFilteredPosts(posts);
    }
  }, [animalType, posts]);

  const fetchPosts = async (page) => {
    try {
      const response = await axios.get(`http://localhost:5000/posts?page=${page}`);
      console.log('API Yanıtı:', response.data);
      setPosts(response.data.posts || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Gönderileri getirme hatası:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.put(`http://localhost:5000/posts/${postId}/like`);
      fetchPosts(currentPage); // Verileri yeniden al
    } catch (error) {
      console.error('Gönderiyi beğenme hatası:', error);
    }
  };

  const handleComment = async (postId) => {
    try {
      const text = commentTexts[postId] || '';
      if (!text.trim()) return;

      await axios.post(`http://localhost:5000/posts/${postId}/comment`, { text });
      fetchPosts(currentPage); // Verileri yeniden al
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Yorum ekleme hatası:', error);
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prevState => ({
      ...prevState,
      [postId]: !prevState[postId]
    }));
  };

  const handleUsernameClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleReportClick = (postId) => {
    if (user) {
      setReportPostId(postId);
      setShowReportModal(true);
    } else {
      alert('Şikayet gönderebilmek için giriş yapmanız gerekmektedir.');
    }
  };

  const handleReportSubmit = async () => {
    try {
      const token = localStorage.getItem('token'); // Token'ı localStorage veya sessionStorage'dan alın
      await axios.post(
        `http://localhost:5000/api/${reportPostId}/report`, 
        { reason: reportReason }, 
        {
          headers: {
            'Authorization': `Bearer ${token}` // Token'ı istekle gönder
          }
        }
      );
      alert('Şikayetiniz başarıyla gönderildi.');
      setShowReportModal(false);
      setReportReason('');
    } catch (error) {
      alert('Şikayet gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };
  
  return (
    <>
      <div className="search-container">
        <h2 className="header-title">Sevgi dolu bir yuva mı arıyorsunuz? Bir hayvan sahiplenin!</h2>
        <Form.Control
          type="text"
          placeholder="Hayvan türünü ara..."
          value={animalType}
          onChange={(e) => setAnimalType(e.target.value)}
          className="search-bar"
        />
      </div>
      <Row lg={3}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <Col key={post._id}>
              <Card className={`post-card ${showComments[post._id] ? 'expanded' : ''}`}>
                <Card.Body>
                <div className="post-sikayet" onClick={() => handleReportClick(post._id)}> &#x22EE; </div>
                  <span className="animal-type">{post.cins}</span>
                  <div className="profile-info">
                    <img
                      src={post.postedBy?.profileImage
                        ? `http://localhost:5000/images/${post.postedBy.profileImage}`
                        : defaultProfileImage}
                      alt="Profil"
                      className="profile-image"
                    />
                    <div className="profile-details">
                      <h5 onClick={() => handleUsernameClick(post.postedBy?._id)} className="profile-name">
                        {post.postedBy?.username}
                      </h5>
                      <p className="post-date">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Card.Text className="post-text">{post.text}</Card.Text>
                  {post.images && post.images.length > 0 && post.images.map((image, index) => (
                    <Card.Img
                      key={index}
                      variant="top"
                      src={`http://localhost:5000/${image.path}`}
                      className="post-image"
                      alt={`Post image ${index}`}
                    />
                  ))}
                  <div className="interaction-buttons">
                    <Button variant="secondary" onClick={() => toggleComments(post._id)} className="comment-button">
                      Yorum Yap
                    </Button>
                    <Button variant="link" onClick={() => handleLike(post._id)} className="like-button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-heart">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      {post.likes?.length || 0}
                    </Button>
                  </div>
                  {showComments[post._id] && (
                    <div className="comments-section open">
                      <div className="comment-section">
                        {user ? (
                          <>
                            <textarea
                              className="form-control comment-textarea"
                              rows="3"
                              value={commentTexts[post._id] || ''}
                              onChange={(e) => setCommentTexts(prev => ({ ...prev, [post._id]: e.target.value }))}
                              placeholder="Yorumunuzu buraya yazın"
                            />
                            <Button variant="primary" onClick={() => handleComment(post._id)} className="submit-comment-button">
                              Yorum Yap
                            </Button>
                          </>
                        ) : (
                         <center> <p>Yorum yapabilmek için <a href="/Giris">giriş yapın</a>.</p></center>
                        )}
                      </div>
                      <h5 className="mt-3">Yorumlar</h5>
                      <div className="comments-list">
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((comment, index) => (
                            <div key={index} className="comment">
                              <img
                                src={comment.commentedBy?.profileImage
                                  ? `http://localhost:5000/images/${comment.commentedBy.profileImage}`
                                  : defaultProfileImage}
                                alt="Profile"
                                className="comment-profile-image"
                              />
                              <span className="comment-username">{comment.commentedBy?.username}</span>
                              <span>{comment.text}</span>
                            </div>
                          ))
                        ) : (
                          <p>Henüz yorum yok.</p>
                        )}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p>Üzgünüm, ilan bulunamadı.</p>
        )}
      </Row>
      <div className="pagination">
        <Button 
          variant="secondary" 
          onClick={() => handlePageChange(page - 1)} 
          disabled={page === 1}
        >
          Önceki
        </Button>
        <span>{page} / {totalPages}</span>
        <Button 
          variant="secondary" 
          onClick={() => handlePageChange(page + 1)} 
          disabled={page === totalPages}
        >
          Sonraki
        </Button>
      </div>
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Şikayet Et</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="reportReason">
            <Form.Label>Şikayet Sebebi</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Şikayet sebebinizi buraya yazın"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>
            Kapat
          </Button>
          <Button variant="primary" onClick={handleReportSubmit}>
            Gönder
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PostCard;
