import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { useAuth } from '../../context/AuthContext'; // AuthContext'i içe aktar
import '../../css/Navbar.css'; // Özel CSS dosyası
import logo from '../../images/logo.jpeg';

function NavScrollExample() {
  const { user, login } = useAuth(); // user ve login fonksiyonlarını al
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    } else {
      const token = sessionStorage.getItem('token');
      if (token) {
        login(token); // login fonksiyonu ile kullanıcıyı yükle
      }
    }
  }, [user, login]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container fluid>
      <Navbar.Brand as={Link} to="/" className="navbar-brand">
          <img 
            src= {logo}
            alt="Yuvapat Logo" 
            className="navbar-logo" 
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="left-nav me-auto my-2 my-lg-0">
            <Nav.Link as={Link} to="/" className="nav-link">Ana Sayfa</Nav.Link>
            <Nav.Link as={Link} to="/hayvanSahiplendirme" className="nav-link">Evcil Hayvan Sahiplendirme</Nav.Link>
            <Nav.Link as={Link} to="/Kayipİlan" className="nav-link">Kayıp ve Bulunan Hayvanlar</Nav.Link>
          </Nav>
          <Nav>
            {isLoggedIn ? (
              <>
                <Nav.Link as={Link} to="/mesajlar" className="nav-link">Mesajlar</Nav.Link>
                <Nav.Link as={Link} to="/Profil" className="nav-link">Profil</Nav.Link>
                <Nav.Link as={Link} to="/" onClick={handleLogout} className="nav-link">Çıkış Yap</Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/Giris" className="nav-link">Giriş Yap</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavScrollExample;
