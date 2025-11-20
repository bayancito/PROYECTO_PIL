// En: src/pages/LogisticaPage.js

import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix iconos
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_PEDIDOS = '/pedidos/';
const API_CONDUCTORES = '/conductores/';
const API_VEHICULOS = '/vehiculos/';
const API_ASIGNAR_RUTA = '/logistica/asignar-ruta/';

const centroCochabamba = [-17.393879, -66.156944];

function LogisticaPage() {
  const [pedidos, setPedidos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState([]); 
  const [conductorSeleccionado, setConductorSeleccionado] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiClient.get(API_PEDIDOS),
      apiClient.get(API_CONDUCTORES),
      apiClient.get(API_VEHICULOS)
    ])
    .then(([responsePedidos, responseConductores, responseVehiculos]) => {
      setPedidos(responsePedidos.data);
      setConductores(responseConductores.data);
      setVehiculos(responseVehiculos.data);
      setLoading(false);
    })
    .catch(error => {
      console.error("Error al cargar datos:", error);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
  const conductoresDisponibles = conductores.filter(c => c.estado === 'disponible');
  const pedidosEnCamino = pedidos.filter(p => p.estado === 'en_camino' && p.latitud && p.longitud);

  const handleAsignarRuta = (event) => {
    event.preventDefault();
    if (pedidosSeleccionados.length === 0) { alert("Seleccione al menos un pedido."); return; }
    if (!conductorSeleccionado) { alert("Seleccione un conductor."); return; }
    
    const datosAsignacion = {
      conductor_id: conductorSeleccionado,
      pedido_ids: pedidosSeleccionados
    };
    
    apiClient.post(API_ASIGNAR_RUTA, datosAsignacion)
      .then(response => {
        alert(response.data.mensaje); 
        setPedidosSeleccionados([]);
        setConductorSeleccionado('');
        fetchData(); 
      })
      .catch(error => {
        console.error("Error:", error);
        alert("Error al asignar la ruta.");
      });
  };

  const handleTogglePedido = (pedidoId) => {
    setPedidosSeleccionados(prev => {
      if (prev.includes(pedidoId)) return prev.filter(id => id !== pedidoId);
      return [...prev, pedidoId];
    });
  };

  if (loading) return <div className="page-container"><h2>Cargando panel...</h2></div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Panel de Logística</h1>
      
      {/* TARJETA 1: MAPA DE MONITOREO */}
      <div className="content-card">
        <h2 className="section-title">Monitoreo en Tiempo Real</h2>
        <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd' }}>
          <MapContainer center={centroCochabamba} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {pedidosEnCamino.map(pedido => (
              <Marker key={pedido.id} position={[pedido.latitud, pedido.longitud]}>
                <Popup>
                  <b>Pedido #{pedido.id}</b><br />Estado: {pedido.estado}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
          Mostrando {pedidosEnCamino.length} pedidos activos en ruta.
        </p>
      </div>
      
      {/* TARJETA 2: ASIGNACIÓN DE RUTAS */}
      <div className="content-card">
        <h2 className="section-title">Asignación de Rutas</h2>
        <form onSubmit={handleAsignarRuta}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* Columna Izquierda: Lista de Pedidos */}
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>1. Seleccionar Pedidos Pendientes</h3>
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto', 
                border: '1px solid #eee', 
                borderRadius: '8px',
                backgroundColor: '#f9f9f9' 
              }}>
                {pedidosPendientes.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No hay pedidos pendientes.</div>
                ) : (
                  <ul className="data-list">
                    {pedidosPendientes.map(pedido => (
                      <li key={pedido.id} className="data-item" style={{ padding: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer' }}>
                          <input 
                            type="checkbox"
                            checked={pedidosSeleccionados.includes(pedido.id)}
                            onChange={() => handleTogglePedido(pedido.id)}
                            style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                          />
                          <div>
                            <strong>Pedido #{pedido.id}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Cliente ID: {pedido.cliente}</div>
                          </div>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Columna Derecha: Conductor y Botón */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>2. Asignar Conductor</h3>
                <select 
                  className="form-select"
                  value={conductorSeleccionado}
                  onChange={e => setConductorSeleccionado(e.target.value)}
                >
                  <option value="">-- Seleccione Conductor --</option>
                  {conductoresDisponibles.map(conductor => (
                    <option key={conductor.id} value={conductor.id}>
                      {conductor.nombre} (Lic: {conductor.licencia})
                    </option>
                  ))}
                </select>
                {conductoresDisponibles.length === 0 && (
                  <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '5px' }}>
                    ⚠ No hay conductores disponibles.
                  </p>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                CREAR Y ASIGNAR RUTA
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}

export default LogisticaPage;