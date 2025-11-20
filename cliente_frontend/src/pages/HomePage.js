import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Importa el CSS específico
// Asegúrate de haber instalado los iconos: npm install react-icons
import { FaTruckMoving, FaBoxOpen, FaMapMarkedAlt, FaClipboardList } from 'react-icons/fa';

function HomePage() {
  return (
    <div className="hero-container">
      
      {/* Título Principal */}
      <div className="hero-content">
        <p>Logística Inteligente</p>
        <h1>Optimizamos la energía de tu distribución</h1>
      </div>

      {/* Cuadrícula de Tarjetas */}
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

      {/* Botón de Acción */}
      <div className="cta-container">
        <Link to="/pedidos" className="cta-button">
          Comenzar un Pedido
        </Link>
      </div>

    </div>
  );
}

export default HomePage;