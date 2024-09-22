import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostForm from '../components/api/PostForm';
import PostList from '../components/api/PosList';

const HayvanSahiplendirme = () => {
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
        }
      } catch (error) {}
    };

    checkAuth();
  }, []);

  return (
    <>
      
      {isAuthenticated ? <PostForm /> :<h2 className="mt-4 mb-3"> Lütfen ilan paylaşmak için giriş yapınız.</h2> }
      <PostList />
 
    </>
  );
};

export default HayvanSahiplendirme;
