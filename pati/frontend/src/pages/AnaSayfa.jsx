import React from 'react';

import Arama from '../components/api/arama';
import Posthayvanlar from '../components/api/Posthayvanlar';
import ContactPage from '../components/api/ContactPage';
import BlogApi from '../components/api/BlogApi';
import '../css/AnaSayfa.css'
const Ana_Sayfa = () => {
  return (

 
    <div >  
      <Arama />
      <BlogApi />
      <ContactPage />

    </div>
  
  )
}

export default Ana_Sayfa;
