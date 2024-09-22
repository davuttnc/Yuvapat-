import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AnaSayfa from './pages/AnaSayfa';
import GirisSayfasi from './pages/GirisSayfasi';
import HayvanSahiplendirme from './pages/HayvanSahiplendirme';
import Kayipİlan from './pages/Kayipİlan';
import { AuthProvider } from './context/AuthContext';
import UserProfile from './components/api/UserProfile'; 
import NotFound from './components/api/NotFound';
import UserDetail from './components/api/UserDetail';
import Mesajlar from './pages/Mesajlar';
import ChatPage from './components/api/ChatPage';
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container" style={{maxWidth: '80%'}}>
            <Routes>
            <Route path="/mesajlar" element={<Mesajlar />} />
              <Route path="/users/:id" element={<UserDetail />} />
              <Route path="/chat/:receiverId" element={<ChatPage />} /> 
              <Route path="/Profil" element={<UserProfile />} />
              <Route path="/" element={<AnaSayfa />} />
              <Route path="/Giris" element={<GirisSayfasi />} />
              <Route path="/hayvanSahiplendirme" element={<HayvanSahiplendirme />} />
              <Route path="/Kayipİlan" element={<Kayipİlan />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;


