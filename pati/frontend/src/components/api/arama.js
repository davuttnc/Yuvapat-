import React from 'react';
import { Row, Col } from 'react-bootstrap';
import kittyImage from '../../images/anasayfa.png'; // CSS dosyanızın adını buraya göre güncelleyin
import '../../css/AnaSayfa.css';

const Arama = () => {
  return (
    <div className="py-6 arama-kutusu">
      <Row className="align-items-center">
        <Col md={6}>
          <h1 id="arama-baslik1">Yuvapat</h1>
          <p className="arama-yazi1">Hayvanseverlere yönelik uygulamamız, tüm hayvanseverlerin buluşup etkileşimde bulunabileceği bir platform olmayı hedefliyor</p>
        </Col>
        <Col md={6} className="text-center">
          <img src={kittyImage} alt="Kedi Resmi" className="arama-resim arama-resim-animate" />
        </Col>
      </Row>
    </div>
  );
};

export default Arama;
