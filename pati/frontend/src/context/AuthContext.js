import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (token) {
        const response = await axios.get(`${API_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUser(response.data);
      }
    } catch (error) {
      console.error('Kullanıcı bilgilerini alma hatası:', error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
