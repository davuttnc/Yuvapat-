import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import '../../css/ChatPage.css';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

const ChatPage = () => {
  const { receiverId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${receiverId}`);
        if (!response.ok) {
          throw new Error(`Sunucu hatası: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        setReceiver(data.user);
      } catch (error) {
        console.error('Kullanıcı bilgilerini alma hatası:', error);
      }
    };

    fetchUserDetails();

    const fetchMessages = async () => {
      try {
        const roomId = [user._id, receiverId].sort().join('_');
        const response = await fetch(`${API_URL}/messages/${roomId}`);
        if (!response.ok) {
          throw new Error(`Sunucu hatası: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Mesajları alma hatası:', error);
      }
    };
    
    fetchMessages();

    const handleReceiveMessage = (receivedMessage) => {
      console.log('Yeni alınan mesaj:', receivedMessage);
      setMessages(prevMessages => [...prevMessages, receivedMessage]);
    };

    if (user) {
      const roomId = [user._id, receiverId].sort().join('_');
      socket.emit('joinRoom', { roomId });
      socket.on('receiveMessage', handleReceiveMessage);

      return () => {
        socket.off('receiveMessage', handleReceiveMessage);
      };
    }
  }, [receiverId, user]);

  const sendMessage = async () => {
    if (message.trim() && user?._id) {
      const roomId = [user._id, receiverId].sort().join('_');
      const newMessage = {
        roomId,
        senderId: user._id,
        receiverId,
        content: message,
        timestamp: new Date()
      };
    
      // WebSocket üzerinden mesajı gönder
      socket.emit('sendMessage', newMessage);
    
      // Mesajı veritabanına kaydet
      try {
        const response = await fetch(`${API_URL}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessage),
        });
        if (!response.ok) {
          throw new Error(`Sunucu hatası: ${response.status} - ${response.statusText}`);
        }
        await response.json();
      } catch (error) {
        console.error('Mesajı kaydetme hatası:', error);
      }
    
      setMessage('');
    }
  };
  
  if (!receiver) {
    return <p>Yükleniyor...</p>;
  }

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.senderId === user?._id ? 'message-sent' : 'message-received'}`}
          >
            <p><strong>{msg.senderId === user?._id ? 'Sen': receiver.username}:</strong> {msg.content}</p>
          </div>
        ))}
      </div>
      <div className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Gönder</button>
      </div>
    </div>
  );
};

export default ChatPage;
