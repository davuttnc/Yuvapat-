import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Mesajlar.css'; // Stil dosyasını ekleyin
import { useAuth } from '../context/AuthContext'; // AuthContext importu

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Mesajlar() {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth(); // AuthContext'ten kullanıcı bilgilerini al

  useEffect(() => {
    if (!user) return; // Kullanıcı bilgileri henüz yüklenmediyse return et

    // Kullanıcı bilgilerini almak için API çağrısı yapın
    axios.get(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${user.token}` // Kullanıcı token'ını ekleyin
      }
    })
      .then(response => {
        const userId = response.data._id;

        // Kullanıcıya ait mesajları yükleme
        return axios.get(`${API_URL}/messages/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}` // Kullanıcı token'ını ekleyin
          }
        });
      })
      .then(response => {
        setConversations(response.data);
      })
      .catch(error => {
        console.error('Mesajları yükleme hatası:', error);
        if (error.response) {
          console.error('API Yanıtı:', error.response.data);
        }
      });
  }, [user]);

  const handleConversationClick = (conversation) => {
    // Konuşma detayları al
    const { lastMessageSender, participants } = conversation;
    if (!participants || !participants.length) return;

    // Katılımcıların içerisinden kullanıcıya ait olmayanı bulun
    const otherUserId = participants.find(id => id !== user._id);

    // Eğer kullanıcı son mesajı göndermediyse, diğer kullanıcıya yönlendir
    const targetUserId = lastMessageSender !== user._id ? lastMessageSender : otherUserId;
    
    navigate(`/chat/${targetUserId}`);
  };

  if (!conversations.length) {
    return <p> henüz bir mesaj yok...</p>;
  }

  return (
    <div className="container mt-4">
      <h2>sohpet geçmişi</h2>
      <div className="list-group">
        {conversations.map((convo, index) => (
          <button
            key={index}
            className="list-group-item list-group-item-action"
            onClick={() => handleConversationClick(convo)}
          >
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">{convo.participantsUsernames.find(username => username !== user.username) || 'Bilinmiyor'}</h5>
              <small>{new Date(convo.lastMessageTimestamp).toLocaleString()}</small> {/* Tarihi formatla */}
            </div>
            <p className="mb-1">{convo.lastMessage}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Mesajlar;
