import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css'; import './GeneralStyles.css';
import logoPil from './assets/pil-logo.png'; 

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ConductoresPage from './pages/ConductoresPage';
import ProductosPage from './pages/ProductosPage';
import PedidosPage from './pages/PedidosPage';
import LogisticaPage from './pages/LogisticaPage';
import ReportesPage from './pages/ReportesPage';
import MiRutaPage from './pages/MiRutaPage';
import CrearProductoPage from './pages/CrearProductoPage';
import EditarProductoPage from './pages/EditarProductoPage';
import EditarConductorPage from './pages/EditarConductorPage';
// --- IMPORTAR NUEVAS PAGINAS ---
import HistorialPage from './pages/HistorialPage';
import IncidenciaPage from './pages/IncidenciaPage';

const isAuthenticated = () => localStorage.getItem('token') !== null;
const getUserRole = () => localStorage.getItem('rol');
const PrivateRoute = ({ children }) => isAuthenticated() ? children : <Navigate to="/login" />;

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
  const [menuAbierto, setMenuAbierto] = useState(false);
  const toggleMenu = () => setMenuAbierto(!menuAbierto);
  const closeMenu = () => setMenuAbierto(false);

  return (
    <div className="App">
      {isAuthenticated() && (
        <>
          <nav className="navbar">
            <div className="navbar-logo">
              <Link to="/" className="nav-logo-link" onClick={closeMenu}>
                <img src={logoPil} alt="PIL Andina" className="nav-logo-img" />
              </Link>
            </div>
            <div className="menu-icon" onClick={toggleMenu}>&#9776;</div>
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
                <>
                  <Link to="/mi-ruta" className="sidebar-link" onClick={closeMenu}>Mi Ruta</Link>
                  <Link to="/historial" className="sidebar-link" onClick={closeMenu}>Historial</Link>
                  <Link to="/incidencia" className="sidebar-link" onClick={closeMenu}>Reportar Problema</Link>
                </>
              )}
              <div style={{ marginTop: '20px', padding: '0 15px' }}><LogoutButton /></div>
            </div>
          </div>
          {menuAbierto && <div className="overlay" onClick={closeMenu}></div>}
        </>
      )}

      <div style={{ padding: '0' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          
          <Route path="/conductores" element={<PrivateRoute><ConductoresPage /></PrivateRoute>} />
          <Route path="/conductores/editar/:id" element={<PrivateRoute><EditarConductorPage /></PrivateRoute>} />
          
          <Route path="/productos" element={<PrivateRoute><ProductosPage /></PrivateRoute>} />
          <Route path="/productos/nuevo" element={<PrivateRoute><CrearProductoPage /></PrivateRoute>} />
          <Route path="/productos/editar/:id" element={<PrivateRoute><EditarProductoPage /></PrivateRoute>} />
          
          <Route path="/pedidos" element={<PrivateRoute><PedidosPage /></PrivateRoute>} />
          <Route path="/logistica" element={<PrivateRoute><LogisticaPage /></PrivateRoute>} />
          <Route path="/reportes" element={<PrivateRoute><ReportesPage /></PrivateRoute>} />
          
          <Route path="/mi-ruta" element={<PrivateRoute><MiRutaPage /></PrivateRoute>} />
          {/* --- NUEVAS RUTAS --- */}
          <Route path="/historial" element={<PrivateRoute><HistorialPage /></PrivateRoute>} />
          <Route path="/incidencia" element={<PrivateRoute><IncidenciaPage /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return <Router><AppContent /></Router>;
}

export default App;