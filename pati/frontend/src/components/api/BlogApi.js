import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import poster from '../../images/blog.png';
import poster2 from '../../images/blog1.png';
import '../../css/AnaSayfa.css';

function BlogApi() {
  return (
    <Container fluid className="blog-api-container">
      <div className="arama-baslik-box">
        <h2 style={{color:'#ffffff' ,textAlign:'center' ,fontSize:'2rem'}}>Hakkımızda</h2>
      </div>
      <Row className="align-items-center">
        <Col md={6}>
          <img src={poster} alt="Poster" className="poster poster-left" />
        </Col>
        <Col md={6} className="text-content">
          <h5 className="arama-baslik"> Bir Canlının Yeni Yuvası</h5>
          <p className="arama-yazi arama-yazi-animate">
          "Yuvapat, sadece bir web sitesi değil, aynı zamanda bir umut ışığı. Sokaklarda yaşayan, barınaklarda bekleyen binlerce canlının yuvasını bulmasına yardımcı olmak için varız. Çünkü her canlı, sevgi dolu bir aileye ve sıcak bir yuvaya hak eder. Yuvapat'ta, sahiplenebileceğiniz birbirinden tatlı ve özel hayvanlarla tanışabilir, onlara bir ömür boyu sürecek bir yuva sağlayabilirsiniz. Unutmayın, sahiplenmek sadece bir hayvana ev vermekle kalmaz, aynı zamanda hayatına dokunmak, ona yeni bir başlangıç sunmaktır.
          </p>
        </Col>
      </Row>
      <Row className="align-items-center mt-5">
        <Col md={6} className="text-content">
          <h5 className="arama-baslik">Yuvapat nedir?</h5>
          <p className="arama-yazi arama-yazi-animate">
          Yuvapat ile sahiplenme özelliğiyle istediğiniz köpek veya kedi cinsine yeni bir yuva sağlayabilir veya kendinize sevimli bir arkadaş edinebilirsiniz. Ayrıca tüylü dostunuzun sosyalleşmesi için eğlenceli oyun arkadaşları da bulabilirsiniz.
          </p>
        </Col>
        <Col md={6}>
          <img src={poster2} alt="Poster" className="poster poster-right" />
        </Col>
      </Row>
    </Container>
  );
}

export default BlogApi;
