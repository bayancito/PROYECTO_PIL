// En: src/pages/MiRutaPage.js

import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix iconos Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const centroCochabamba = [-17.393879, -66.156944];

function MiRutaPage() {
  const [datosRuta, setDatosRuta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRuta = () => {
    setLoading(true);
    apiClient.get('/mi-ruta/')
      .then(response => {
        setDatosRuta(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Error al cargar tu ruta.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRuta();
  }, []);

  const marcarEntregado = (pedidoId) => {
    if (!window.confirm("¿Confirmar entrega del pedido?")) return;

    apiClient.patch(`/pedidos/${pedidoId}/`, { estado: 'entregado' })
      .then(() => {
        alert("¡Pedido entregado!");
        fetchRuta(); 
      })
      .catch(err => {
        alert("Error al actualizar pedido");
        console.error(err);
      });
  };

  if (loading) return <div className="page-container"><h2>Cargando tu ruta...</h2></div>;
  if (error) return <div className="page-container"><h2 style={{color: 'red'}}>{error}</h2></div>;
  
  // Mensaje si no hay rutas
  if (datosRuta && datosRuta.mensaje) {
    return (
      <div className="page-container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <div className="content-card">
          <h2 style={{ color: '#28a745' }}>✅ Todo listo</h2>
          <p style={{ fontSize: '1.2rem' }}>{datosRuta.mensaje}</p>
        </div>
      </div>
    );
  }

  const pedidos = datosRuta.pedidos || [];

  return (
    <div className="page-container">
      <h1 className="page-title">Hola, {datosRuta.conductor}</h1>
      
      {/* TARJETA DEL MAPA */}
      <div className="content-card">
        <h2 className="section-title">Tu Ruta Activa (ID: {datosRuta.ruta_id})</h2>
        <div style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd' }}>
          <MapContainer center={centroCochabamba} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {pedidos.map(pedido => (
              pedido.latitud && (
                <Marker key={pedido.id} position={[pedido.latitud, pedido.longitud]}>
                  <Popup>
                    <b>Pedido #{pedido.id}</b><br />
                    Cliente ID: {pedido.cliente}
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      </div>

      {/* LISTA DE ENTREGAS (Diseño de tarjetas individuales para móvil) */}
      <h3 style={{ margin: '30px 0 15px 0', color: '#555' }}>
        Entregas Pendientes: {pedidos.length}
      </h3>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {pedidos.map(pedido => (
          <div key={pedido.id} className="content-card" style={{ marginBottom: '0', borderLeft: '5px solid #003DA5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Pedido #{pedido.id}</h4>
              <span style={{ 
                backgroundColor: '#fff3cd', color: '#856404', 
                padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' 
              }}>
                {pedido.estado}
              </span>
            </div>
            
            <div style={{ marginBottom: '20px', color: '#555' }}>
              <p style={{ margin: '5px 0' }}><strong>Cliente ID:</strong> {pedido.cliente}</p>
              <p style={{ margin: '5px 0' }}><strong>Coordenadas:</strong> {pedido.latitud}, {pedido.longitud}</p>
            </div>

            <button 
              onClick={() => marcarEntregado(pedido.id)}
              className="btn btn-success" 
              style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
            >
              MARCAR COMO ENTREGADO
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MiRutaPage;