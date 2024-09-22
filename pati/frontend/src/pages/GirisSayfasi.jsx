import React, { useState } from 'react';
import LoginForm from '../components/api/LoginForm';
import RegisterForm from '../components/api/RegisterForm';

function GirisSayfasi() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div>
      {showRegister ? (
        <>
          <RegisterForm />
          <p className="text-center mt-3">
            Zaten hesabınız var mı? <button className="btn btn-link" onClick={() => setShowRegister(false)}>Giriş Yap</button>
          </p>
        </>
      ) : (
        <>
          <LoginForm />
          <p className="text-center mt-3">
            Hesabınız yok mu? <button className="btn btn-link" onClick={() => setShowRegister(true)}>Kayıt Ol</button>
          </p>
        </>
      )}
    </div>
  );
}

export default GirisSayfasi;
