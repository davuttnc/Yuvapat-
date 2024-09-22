import React from 'react';
import poster from '../../images/404.png';
const NotFound = () => {
  return (
    <div>
      <center><h3>Üzgünüz, aradığınız sayfa bulunamadı.</h3></center>
      <img src={poster} alt="Poster" /> 
    </div>
  );
};

export default NotFound;
