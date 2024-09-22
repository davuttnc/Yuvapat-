import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../../css/footer.css'
const Footer = () => {
  return (
    <footer className="bg-dark text-white py-3 mt-5">
      <Container>
        <Row>
          <Col md={6}>
            <p>&copy; 2024 Yuvapat. Tüm hakları saklıdır.</p>
          </Col>
          <Col md={6} className="text-md-end">
            <p>Kullanıcı Hakları | Gizlilik Politikası | İletişim</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
