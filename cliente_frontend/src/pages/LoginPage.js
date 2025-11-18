// En: src/pages/LoginPage.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- ¡PASO 1: IMPORTA TU NUEVO CSS! ---
import './LoginPage.css'; 

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
        window.location.href = '/'; // Redirige y recarga
      })
      .catch(error => {
        if (error.response && error.response.data.error) {
          setError(error.response.data.error); 
        } else {
          // Este error es el '401' o 'No se pudo conectar'
          setError("Credenciales inválidas o error de conexión."); 
        }
      });
  };

  // --- PASO 2: AÑADE LOS 'className' A TU JSX ---
  return (
    <div className="login-container"> {/* Contenedor principal */}
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        
        <div className="form-group"> {/* Grupo 1 */}
          <label>Usuario: </label>
          <input 
            type="text" 
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        
        <div className="form-group"> {/* Grupo 2 */}
          <label>Contraseña: </label>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        
        {/* Muestra el error con su propia clase */}
        {error && <p className="login-error">{error}</p>}
        
        <button type="submit" className="login-button">Entrar</button>
      </form>
    </div>
  );
}

export default LoginPage;