import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import './ReportesPage.css';
import { FaBox, FaCheckCircle, FaTruck, FaExclamationTriangle } from 'react-icons/fa';

// Importaciones de Chart.js
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

// ... imports

function ReportesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // <--- 1. Nuevo estado para error

  useEffect(() => {
    apiClient.get('/reportes/dashboard/') // Verifica que esta URL coincida con tu urls.py
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error detallado:", err);
        // <--- 2. Guardamos el error para mostrarlo
        setError("Error al cargar datos. Revisa la consola (F12) o la terminal de Django.");
        setLoading(false);
      });
  }, []);

  // <--- 3. Mostramos el mensaje de error si existe
  if (loading) return <div className="page-container"><h2>Cargando analíticas...</h2></div>;
  if (error) return <div className="page-container"><h2 style={{color:'red'}}>{error}</h2></div>;
  if (!data) return <div className="page-container"><h2>No hay datos disponibles.</h2></div>;

  // ... resto del código ...

  if (loading || !data) return <div className="page-container"><h2>Cargando analíticas...</h2></div>;

  // --- CONFIGURACIÓN GRÁFICO DE LÍNEA ---
  const lineChartData = {
    labels: data.grafico_dias.labels,
    datasets: [{
      label: 'Pedidos Entregados',
      data: data.grafico_dias.data,
      borderColor: '#003DA5',
      backgroundColor: 'rgba(0, 61, 165, 0.1)',
      tension: 0.4, // Curva suave
      fill: true,
    }]
  };
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } }, x: { grid: { display: false } } }
  };

  // --- CONFIGURACIÓN GRÁFICO DE DONA ---
  const doughnutData = {
    labels: ['Pendientes', 'En Camino', 'Entregados Hoy'],
    datasets: [{
      data: [data.grafico_estados.pendientes, data.grafico_estados.en_camino, data.grafico_estados.entregados_hoy],
      backgroundColor: ['#FFC107', '#2196F3', '#4CAF50'],
      borderWidth: 0,
    }]
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  return (
    <div className="page-container" style={{background: '#f4f7f6'}}>
      <h1 className="page-title" style={{textAlign: 'left'}}>Analíticas de Operación</h1>

      {/* NIVEL 1: TARJETAS KPI */}
      <div className="dashboard-grid">
        <div className="kpi-card">
          <div className="kpi-data">
            <h3>{data.kpis.total_mes}</h3>
            <p>Pedidos este Mes</p>
          </div>
          <FaBox className="kpi-icon" style={{color: '#003DA5'}} />
        </div>
        <div className="kpi-card">
          <div className="kpi-data">
            <h3>{data.kpis.tasa_exito}%</h3>
            <p>Tasa de Éxito</p>
          </div>
          <FaCheckCircle className="kpi-icon" style={{color: '#4CAF50'}} />
        </div>
        <div className="kpi-card">
          <div className="kpi-data">
            <h3>{data.kpis.conductores_activos} / {data.kpis.conductores_totales}</h3>
            <p>Flota Activa Hoy</p>
          </div>
          <FaTruck className="kpi-icon" style={{color: '#2196F3'}} />
        </div>
        <div className="kpi-card">
          <div className="kpi-data">
            <h3 style={{color: '#DA291C'}}>{data.kpis.incidencias}</h3>
            <p>Incidencias</p>
          </div>
          <FaExclamationTriangle className="kpi-icon" style={{color: '#DA291C'}} />
        </div>
      </div>

      {/* NIVEL 2: GRÁFICOS */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3 className="section-header">Tendencia de Entregas (Últimos 7 días)</h3>
          <div style={{height: '300px'}}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
        <div className="chart-container">
          <h3 className="section-header">Estado Actual</h3>
          <div style={{height: '300px'}}>
             <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* NIVEL 3: TABLAS TOP */}
      <div className="tops-grid">
        <div className="top-list-container">
          <h3 className="section-header">🏆 Top Conductores del Mes</h3>
          <ul className="top-list">
            {data.top_conductores.map((c, i) => (
              <li key={i} className="top-item">
                <strong>{i+1}. {c.nombre}</strong>
                <span className="top-value">{c.entregas} entregas</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="top-list-container">
          <h3 className="section-header">🥛 Productos Más Vendidos</h3>
          <ul className="top-list">
            {data.top_productos.map((p, i) => (
              <li key={i} className="top-item">
                <strong>{p.producto__nombre}</strong>
                <span className="top-value">{p.total_vendido} unid.</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}

export default ReportesPage;