import React from 'react';
// ¡Añade useNavigate a la importación!
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// Importamos todas las páginas
import ConductoresPage from './pages/ConductoresPage';
import ProductosPage from './pages/ProductosPage';
import PedidosPage from './pages/PedidosPage';
import LogisticaPage from './pages/LogisticaPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

// --- LÓGICA DE AUTENTICACIÓN ---
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

const getUserRole = () => {
  return localStorage.getItem('rol');
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// ¡NUEVO COMPONENTE! Botón para cerrar sesión
const LogoutButton = () => {
  // useNavigate solo funciona dentro de un componente renderizado por el Router
  // ¡Pero window.location.href funciona siempre!
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    window.location.href = '/login'; // Forzamos recarga al login
  };

  return (
    <button 
      onClick={handleLogout} 
      style={{ color: '#61dafb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1em', margin: '10px' }}
    >
      Cerrar Sesión
    </button>
  );
};
// ---------------------------------------------


function AppContent() {
  // Movemos la lógica que necesita 'useNavigate' o 'useLocation' aquí
  const rol = getUserRole();

  return (
    <div className="App">
      {/* Mostramos la navegación solo si estamos logueados */}
      {isAuthenticated() && (
        <nav style={{ 
          backgroundColor: '#282c34', 
          padding: '20px', 
          width: '100%', 
          borderBottom: '2px solid #61dafb',
          display: 'flex',
          justifyContent: 'flex-start'
        }}>
          
          {/* Vistas para TODOS */}
          <Link to="/" style={{ color: 'white', margin: '10px' }}>
            Inicio
          </Link>

          {/* Vistas SOLO PARA ADMIN */}
          {rol === 'admin' && (
            <>
              <Link to="/conductores" style={{ color: 'white', margin: '10px' }}>
                Conductores
              </Link>
              <Link to="/productos" style={{ color: 'white', margin: '10px' }}>
                Productos
              </Link>
              <Link to="/pedidos" style={{ color: 'white', margin: '10px' }}>
                Pedidos
              </Link>
              <Link to="/logistica" style={{ color: 'white', margin: '10px' }}>
                Logística
              </Link>
            </>
          )}

          {/* (Vistas SOLO PARA CONDUCTOR irían aquí) */}
          
          <div style={{ marginLeft: 'auto' }}>
            <LogoutButton />
          </div>

        </nav>
      )}

      <div style={{ padding: '20px' }}>
        <Routes>
          {/* RUTA DE LOGIN (Pública) */}
          <Route path="/login" element={<LoginPage />} />

          {/* RUTAS PRIVADAS */}
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/conductores" element={<PrivateRoute><ConductoresPage /></PrivateRoute>} />
          <Route path="/productos" element={<PrivateRoute><ProductosPage /></PrivateRoute>} />
          <Route path="/pedidos" element={<PrivateRoute><PedidosPage /></PrivateRoute>} />
          <Route path="/logistica" element={<PrivateRoute><LogisticaPage /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

// Envolvemos AppContent con el Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;