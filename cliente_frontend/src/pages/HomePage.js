// En: src/pages/HomePage.js

import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; 
import { FaTruckMoving, FaBoxOpen, FaMapMarkedAlt, FaClipboardList } from 'react-icons/fa';

// --- 1. IMPORTAMOS LA IMAGEN DESDE ASSETS ---
// (Como estamos en 'pages', subimos un nivel con '../' para ir a 'assets')
import bgImage from '../assets/pil-fabrica-bg.jpg';

function HomePage() {

  // --- 2. CREAMOS EL ESTILO DE FONDO AQUÍ ---
  // Usamos la variable 'bgImage' que acabamos de importar
  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  return (
    // --- 3. APLICAMOS EL ESTILO AL DIV ---
    <div className="hero-container" style={heroStyle}>
      
      <div className="hero-content">
        <p>LOGÍSTICA INTELIGENTE</p>
        <h1>Optimizamos la energía de tu distribución</h1>
      </div>

      <div className="features-grid">
        
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

      </div>

      <div className="cta-container">
        <Link to="/pedidos" className="cta-button">
          COMENZAR UN PEDIDO
        </Link>
      </div>

    </div>
  );
}

export default HomePage;