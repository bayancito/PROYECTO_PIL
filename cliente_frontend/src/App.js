import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css'; // Importamos los estilos globales
import './GeneralStyles.css'; // Importamos los estilos de formularios/tablas

// --- IMPORTACIÓN DE LA IMAGEN DEL LOGO ---
// Asegúrate de que la imagen esté en src/assets/pil-logo.png
import logoPil from './assets/pil-logo.png'; 

// --- IMPORTACIÓN DE PÁGINAS ---
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ConductoresPage from './pages/ConductoresPage';
import ProductosPage from './pages/ProductosPage';
import PedidosPage from './pages/PedidosPage';
import LogisticaPage from './pages/LogisticaPage';
import ReportesPage from './pages/ReportesPage';
import MiRutaPage from './pages/MiRutaPage';

// --- LÓGICA DE AUTENTICACIÓN ---
const isAuthenticated = () => localStorage.getItem('token') !== null;
const getUserRole = () => localStorage.getItem('rol');

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Componente Botón de Cerrar Sesión
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
  
  // Estado para el menú lateral (hamburguesa)
  const [menuAbierto, setMenuAbierto] = useState(false);
  
  const toggleMenu = () => setMenuAbierto(!menuAbierto);
  const closeMenu = () => setMenuAbierto(false);

  return (
    <div className="App">
      
      {isAuthenticated() && (
        <>
          {/* --- BARRA DE NAVEGACIÓN SUPERIOR --- */}
          <nav className="navbar">
            
            {/* 1. LOGO (IMAGEN) A LA IZQUIERDA */}
            <div className="navbar-logo">
              <Link to="/" className="nav-logo-link" onClick={closeMenu}>
                <img src={logoPil} alt="PIL Andina" className="nav-logo-img" />
              </Link>
            </div>

            {/* 2. ÍCONO HAMBURGUESA (Visible en móvil) */}
            <div className="menu-icon" onClick={toggleMenu}>
              &#9776;
            </div>

            {/* 3. ENLACES DE ESCRITORIO (Ocultos en móvil) */}
            <div className="navbar-links desktop-only">
              <Link to="/" className="nav-link">Inicio</Link>

              {rol === 'admin' && (
                <>
                  <Link to="/conductores" className="nav-link">Conductores</Link>
                  <Link to="/productos" className="nav-link">Productos</Link>
                  <Link to="/pedidos" className="nav-link">Pedidos</Link>
                  <Link to="/logistica" className="nav-link">Logística</Link>
                  <Link to="/reportes" className="nav-link">Reportes</Link>
                </>
              )}

              {rol === 'conductor' && (
                <Link to="/mi-ruta" className="nav-link">Mi Ruta</Link>
              )}
              
              <div style={{ marginLeft: '20px' }}><LogoutButton /></div>
            </div>
          </nav>

          {/* --- MENÚ LATERAL (SIDEBAR) --- */}
          <div className={`sidebar ${menuAbierto ? 'open' : ''}`}>
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

              <div style={{ marginTop: '20px', padding: '0 15px' }}>
                <LogoutButton />
              </div>
            </div>
          </div>
          
          {/* FONDO OSCURO (OVERLAY) */}
          {menuAbierto && <div className="overlay" onClick={closeMenu}></div>}
        </>
      )}

      {/* --- RUTAS DE LA APLICACIÓN --- */}
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