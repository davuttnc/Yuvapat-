import React, { useState, useEffect } from 'react';
import axios from 'axios';
import KayipForm from '../components/api/KayipForm';
import KayipPostList from '../components/api/KayipPostList';

function Kayipİlan() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.data) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false); // İsteğin yanıtında kullanıcı bilgisi olmadığından emin olun
        }
      } catch (error) { }
    };
  
    checkAuth();
  }, []);
  

  return (
    <>
      {isAuthenticated ? (
        <KayipForm />
      ) : (
        <h2 className="mt-4 mb-3"> Lütfen ilan paylaşmak için giriş yapınız.</h2>
      )}
      <KayipPostList />
    </>
  );
}

export default Kayipİlan;
