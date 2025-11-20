import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import './ReportesPage.css'; // <--- 1. IMPORTAR CSS

function ReportesPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/reportes/')
      .then(response => {
        setStats(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al cargar reportes:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="dashboard-container"><h2>Cargando estadísticas...</h2></div>;
  if (!stats) return <div className="dashboard-container"><h2>No hay datos.</h2></div>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Reporte de Operaciones PIL</h1>
      
      <div className="cards-grid">
        
        {/* Tarjeta: Entregados */}
        <div className="stat-card card-entregados">
          <h3>Entregados</h3>
          <div className="stat-number">{stats.pedidos.entregados}</div>
          <p className="stat-label">Pedidos completados hoy</p>
        </div>

        {/* Tarjeta: En Camino */}
        <div className="stat-card card-en-camino">
          <h3>En Camino</h3>
          <div className="stat-number">{stats.pedidos.en_camino}</div>
          <p className="stat-label">Rutas activas ahora</p>
        </div>

        {/* Tarjeta: Pendientes */}
        <div className="stat-card card-pendientes">
          <h3>Pendientes</h3>
          <div className="stat-number">{stats.pedidos.pendientes}</div>
          <p className="stat-label">Requieren asignación</p>
        </div>

        {/* Tarjeta: Conductores */}
        <div className="stat-card card-conductores">
          <h3>Flota Libre</h3>
          <div className="stat-number">{stats.conductores.libres}</div>
          <p className="stat-label">Conductores disponibles</p>
        </div>

      </div>

      <div className="summary-section">
        <h3>Total de Pedidos en Sistema: <strong>{stats.pedidos.total}</strong></h3>
      </div>

    </div>
  );
}

export default ReportesPage;