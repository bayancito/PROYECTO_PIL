import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; 
import { FaTruckMoving, FaBoxOpen, FaMapMarkedAlt, FaClipboardList, FaRoute, FaHistory, FaExclamationTriangle } from 'react-icons/fa';
import bgImage from '../assets/pil-fabrica-bg.jpg';

function HomePage() {
  const rol = localStorage.getItem('rol');

  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundColor: '#003DA5'
  };

  return (
    <div className="hero-container" style={heroStyle}>
      <div className="hero-content">
        <p>LOGÍSTICA INTELIGENTE</p>
        <h1>Optimizamos la energía de tu distribución</h1>
      </div>

      <div className="features-grid">
        
        {/* --- ADMIN --- */}
        {rol === 'admin' && (
          <>
            <Link to="/logistica" className="feature-card">
              <div className="icon-container"><FaMapMarkedAlt /></div>
              <h3>Asignación<br/>de Rutas</h3>
            </Link>
            <Link to="/pedidos" className="feature-card">
              <div className="icon-container"><FaClipboardList /></div>
              <h3>Gestión<br/>Completa</h3>
            </Link>
            <Link to="/conductores" className="feature-card">
              <div className="icon-container"><FaTruckMoving /></div>
              <h3>Control de<br/>Flota</h3>
            </Link>
            <Link to="/productos" className="feature-card">
              <div className="icon-container"><FaBoxOpen /></div>
              <h3>Catálogo<br/>en Línea</h3>
            </Link>
          </>
        )}

        {/* --- CONDUCTOR (ACTUALIZADO) --- */}
        {rol === 'conductor' && (
          <>
            <Link to="/mi-ruta" className="feature-card">
              <div className="icon-container"><FaRoute /></div>
              <h3>Mi Ruta<br/>Activa</h3>
            </Link>
            
            <Link to="/historial" className="feature-card">
              <div className="icon-container"><FaHistory /></div>
              <h3>Historial<br/>Entregas</h3>
            </Link>

            <Link to="/incidencia" className="feature-card" style={{ borderColor: '#e74c3c' }}>
              <div className="icon-container" style={{color: '#ff6b6b'}}><FaExclamationTriangle /></div>
              <h3>Reportar<br/>Problema</h3>
            </Link>
          </>
        )}

      </div>

      {rol === 'admin' && (
        <div className="cta-container">
          <Link to="/pedidos" className="cta-button">COMENZAR UN PEDIDO</Link>
        </div>
      )}
    </div>
  );
}

export default HomePage;