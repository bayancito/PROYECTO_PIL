// En: src/pages/LoginPage.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

// 1. IMPORTAMOS LAS IMÁGENES DESDE ASSETS
import logoImg from '../assets/pil-logo.png';
import bgImage from '../assets/pil-fabrica-bg.jpg'; // <-- IMPORTANTE

const API_LOGIN = 'http://127.0.0.1:8000/core/api/login/';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    setError(null);
    const loginData = { username, password };

    axios.post(API_LOGIN, loginData)
      .then(response => {
        const { token, rol } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('rol', rol);
        window.location.href = '/';
      })
      .catch(error => {
        if (error.response && error.response.data.error) {
          setError("Usuario o contraseña incorrectos.");
        } else {
          setError("No se pudo conectar con el servidor.");
        }
      });
  };

  // 2. CREAMOS EL ESTILO DEL FONDO AQUÍ
  const backgroundStyle = {
    backgroundImage: `linear-gradient(rgba(0, 61, 165, 0.8), rgba(0, 30, 80, 0.9)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Open Sans', sans-serif"
  };

  return (
    // 3. APLICAMOS EL ESTILO AL CONTENEDOR
    <div className="login-page-container" style={backgroundStyle}>
      <div className="login-card">
        
        <div className="login-header">
          <img src={logoImg} alt="PIL Andina" className="login-logo" />
          <h2>Bienvenido</h2>
          <p className="subtitle">Sistema de Logística y Distribución</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Usuario</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="Ingrese su usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              className="form-input"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="login-btn">
            INICIAR SESIÓN
          </button>
        </form>
        
      </div>
    </div>
  );
}

export default LoginPage;