import React, { useState } from 'react'; // <--- Importamos useState
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import './GeneralStyles.css';

// Importamos las páginas
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ConductoresPage from './pages/ConductoresPage';
import ProductosPage from './pages/ProductosPage';
import PedidosPage from './pages/PedidosPage';
import LogisticaPage from './pages/LogisticaPage';
import ReportesPage from './pages/ReportesPage';
import MiRutaPage from './pages/MiRutaPage';

// Lógica de Autenticación
const isAuthenticated = () => localStorage.getItem('token') !== null;
const getUserRole = () => localStorage.getItem('rol');

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const LogoutButton = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    window.location.href = '/login'; 
  };
  return <button onClick={handleLogout} className="logout-btn">CERRAR SESIÓN</button>;
};

function AppContent() {
  const rol = getUserRole();
  
  // 1. ESTADO: Controla si el menú está abierto (true) o cerrado (false)
  const [menuAbierto, setMenuAbierto] = useState(false);

  // 2. FUNCIÓN: Alternar entre abierto/cerrado
  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  // 3. FUNCIÓN: Cerrar el menú (útil al hacer clic en un enlace)
  const closeMenu = () => {
    setMenuAbierto(false);
  };

  return (
    <div className="App">
      
      {isAuthenticated() && (
        <>
          {/* --- BARRA DE NAVEGACIÓN (NAVBAR) --- */}
          <nav className="navbar">
            
            {/* Logo a la izquierda */}
            <div className="navbar-logo">
              <Link to="/" className="nav-logo-link" onClick={closeMenu}>PIL</Link>
            </div>

            {/* Ícono de Hamburguesa a la derecha (Siempre visible) */}
            <div className="menu-icon" onClick={toggleMenu}>
              &#9776; {/* Carácter HTML de las 3 líneas */}
            </div>

          </nav>

          {/* --- MENÚ LATERAL DESPLEGABLE (SIDEBAR) --- */}
          {/* Si menuAbierto es true, agregamos la clase 'open' */}
          <div className={`sidebar ${menuAbierto ? 'open' : ''}`}>
            
            {/* Botón X para cerrar */}
            <button className="close-btn" onClick={toggleMenu}>&times;</button>
            
            <div className="sidebar-content">
              <div className="sidebar-header">MENÚ</div>
              
              <Link to="/" className="sidebar-link" onClick={closeMenu}>Inicio</Link>

              {rol === 'admin' && (
                <>
                  <Link to="/conductores" className="sidebar-link" onClick={closeMenu}>Conductores</Link>
                  <Link to="/productos" className="sidebar-link" onClick={closeMenu}>Productos</Link>
                  <Link to="/pedidos" className="sidebar-link" onClick={closeMenu}>Pedidos</Link>
                  <Link to="/logistica" className="sidebar-link" onClick={closeMenu}>Logística</Link>
                  <Link to="/reportes" className="sidebar-link" onClick={closeMenu}>Reportes</Link>
                </>
              )}

              {rol === 'conductor' && (
                <Link to="/mi-ruta" className="sidebar-link" onClick={closeMenu}>Mi Ruta</Link>
              )}
              
              <div style={{ marginTop: '30px' }}>
                <LogoutButton />
              </div>
            </div>
          </div>

          {/* FONDO OSCURO (Overlay) - Para cerrar al hacer clic afuera */}
          {menuAbierto && <div className="overlay" onClick={closeMenu}></div>}
        </>
      )}

      {/* RUTAS */}
      <div style={{ padding: '0' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/conductores" element={<PrivateRoute><ConductoresPage /></PrivateRoute>} />
          <Route path="/productos" element={<PrivateRoute><ProductosPage /></PrivateRoute>} />
          <Route path="/pedidos" element={<PrivateRoute><PedidosPage /></PrivateRoute>} />
          <Route path="/logistica" element={<PrivateRoute><LogisticaPage /></PrivateRoute>} />
          <Route path="/reportes" element={<PrivateRoute><ReportesPage /></PrivateRoute>} />
          <Route path="/mi-ruta" element={<PrivateRoute><MiRutaPage /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return <Router><AppContent /></Router>;
}

export default App;