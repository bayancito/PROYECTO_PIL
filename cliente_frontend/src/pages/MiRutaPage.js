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

    // Actualizamos el pedido a "entregado"
    // Usamos .patch para actualizar solo un campo
    apiClient.patch(`/pedidos/${pedidoId}/`, { estado: 'entregado' })
      .then(() => {
        alert("¡Pedido entregado!");
        fetchRuta(); // Recargamos la lista
      })
      .catch(err => {
        alert("Error al actualizar pedido");
        console.error(err);
      });
  };

  if (loading) return <h2>Cargando tu ruta...</h2>;
  if (error) return <h2>{error}</h2>;
  
  // Si no hay datos o mensaje de "No tienes rutas"
  if (datosRuta && datosRuta.mensaje) {
    return <h2>{datosRuta.mensaje}</h2>;
  }

  const pedidos = datosRuta.pedidos || [];
  const centroCochabamba = [-17.393879, -66.156944];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Hola, {datosRuta.conductor}</h1>
      <h3>Tu Ruta Activa (ID: {datosRuta.ruta_id})</h3>

      {/* MAPA DE LA RUTA */}
      <MapContainer center={centroCochabamba} zoom={13} style={{ height: '300px', width: '100%', marginBottom: '20px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pedidos.map(pedido => (
          pedido.latitud && (
            <Marker key={pedido.id} position={[pedido.latitud, pedido.longitud]}>
              <Popup>
                <b>Pedido #{pedido.id}</b><br />
                Cliente: {pedido.cliente}
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {/* LISTA DE PEDIDOS */}
      <h3>Entregas Pendientes: {pedidos.length}</h3>
      <div style={{ display: 'grid', gap: '15px' }}>
        {pedidos.map(pedido => (
          <div key={pedido.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: '#2c2c34' }}>
            <h4 style={{margin: '0 0 10px 0'}}>Pedido #{pedido.id}</h4>
            <p><b>Estado:</b> {pedido.estado}</p>
            <p><b>Cliente ID:</b> {pedido.cliente}</p>
            
            <button 
              onClick={() => marcarEntregado(pedido.id)}
              style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', width: '100%' }}
            >
              Marcar como ENTREGADO
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MiRutaPage;