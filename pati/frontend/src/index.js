import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import axios from 'axios';



// Axios interceptor ile her isteğe token ekleyin
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  
  </React.StrictMode>
);
