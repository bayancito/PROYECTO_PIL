// En: src/pages/LogisticaPage.js

import React, { useState, useEffect } from 'react';
// --- CAMBIO 1 ---
// import axios from 'axios'; // Ya no usamos axios
import apiClient from '../api'; // Usamos nuestra instancia con interceptor

// --- ¡NUEVAS IMPORTACIONES PARA EL MAPA! ---
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// (Arreglo para el ícono del marcador)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
// ------------------------------------------

// --- CAMBIO 2 ---
// URLs relativas (la base está en api.js)
const API_PEDIDOS = '/pedidos/';
const API_CONDUCTORES = '/conductores/';
const API_VEHICULOS = '/vehiculos/';
const API_ASIGNAR_RUTA = '/logistica/asignar-ruta/';

// Coordenadas de Cochabamba para centrar el mapa
const centroCochabamba = [-17.393879, -66.156944];

function LogisticaPage() {
  // (Estados... sin cambios)
  const [pedidos, setPedidos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState([]); 
  const [conductorSeleccionado, setConductorSeleccionado] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      // --- CAMBIO 3 ---
      apiClient.get(API_PEDIDOS),      // Era axios.get
      apiClient.get(API_CONDUCTORES), // Era axios.get
      apiClient.get(API_VEHICULOS)    // Era axios.get
    ])
    .then(([responsePedidos, responseConductores, responseVehiculos]) => {
      setPedidos(responsePedidos.data);
      setConductores(responseConductores.data);
      setVehiculos(responseVehiculos.data);
      setLoading(false);
    })
    .catch(error => {
      console.error("Error al cargar datos de logística:", error);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // (Filtros... sin cambios)
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
  const conductoresDisponibles = conductores.filter(c => c.estado === 'disponible');
  const pedidosEnCamino = pedidos.filter(p => p.estado === 'en_camino' && p.latitud && p.longitud);

  const handleAsignarRuta = (event) => {
    event.preventDefault();
    // (Validaciones... sin cambios)
    if (pedidosSeleccionados.length === 0) {
      alert("Seleccione al menos un pedido.");
      return;
    }
    if (!conductorSeleccionado) {
      alert("Seleccione un conductor.");
      return;
    }
    const datosAsignacion = {
      conductor_id: conductorSeleccionado,
      pedido_ids: pedidosSeleccionados
    };
    
    // --- CAMBIO 4 ---
    apiClient.post(API_ASIGNAR_RUTA, datosAsignacion) // Era axios.post
      .then(response => {
        alert(response.data.mensaje); 
        setPedidosSeleccionados([]);
        setConductorSeleccionado('');
        fetchData(); 
      })
      .catch(error => {
        console.error("¡Error al asignar la ruta!", error);
        if (error.response) {
          alert(`Error: ${JSON.stringify(error.response.data)}`);
        } else {
          alert("Error de conexión al asignar la ruta.");
        }
      });
  };

  // (handleTogglePedido... sin cambios)
  const handleTogglePedido = (pedidoId) => {
    setPedidosSeleccionados(prevSeleccionados => {
      if (prevSeleccionados.includes(pedidoId)) {
        return prevSeleccionados.filter(id => id !== pedidoId);
      } else {
        return [...prevSeleccionados, pedidoId];
      }
    });
  };

  if (loading) {
    return <h2>Cargando datos de logística...</h2>;
  }

  // (El return con el JSX/HTML... sin cambios)
  return (
    <div>
      <h2>Panel de Logística</h2>
      
      {/* --- MAPA DE MONITOREO --- */}
      <h3>Monitoreo de Entregas (Pedidos "En Camino")</h3>
      <MapContainer 
        center={centroCochabamba} 
        zoom={13} 
        style={{ height: '400px', width: '100%', marginBottom: '30px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pedidosEnCamino.map(pedido => (
          <Marker 
            key={pedido.id} 
            position={[pedido.latitud, pedido.longitud]}
          >
            <Popup>
              <b>Pedido #{pedido.id}</b><br />
              Cliente ID: {pedido.cliente}<br />
              Estado: {pedido.estado}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <hr />

      {/* --- Formulario de Asignación --- */}
      <h2>Panel de Asignación de Rutas</h2>
      <form onSubmit={handleAsignarRuta}>
        
        <h3>Pedidos Pendientes</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #555', padding: '10px' }}>
          {pedidosPendientes.length === 0 ? (
            <p>(No hay pedidos pendientes)</p>
          ) : (
            pedidosPendientes.map(pedido => (
              <div key={pedido.id}>
                <input 
                  type="checkbox"
                  id={`pedido-${pedido.id}`}
                  checked={pedidosSeleccionados.includes(pedido.id)}
                  onChange={() => handleTogglePedido(pedido.id)}
                />
                <label htmlFor={`pedido-${pedido.id}`}>
                  Pedido #{pedido.id} (Cliente ID: {pedido.cliente})
                </label>
              </div>
            ))
          )}
        </div>

        <h3 style={{ marginTop: '20px' }}>Asignar a Conductor</h3>
        <select 
          value={conductorSeleccionado}
          onChange={e => setConductorSeleccionado(e.target.value)}
        >
          <option value="">Seleccione un conductor disponible...</option>
          {conductoresDisponibles.map(conductor => (
            <option key={conductor.id} value={conductor.id}>
              {conductor.nombre} (Lic: {conductor.licencia})
            </option>
          ))}
        </select>

        <button type="submit" style={{ display: 'block', marginTop: '30px', fontSize: '1.2em' }}>
          Crear y Asignar Ruta
        </button>
      </form>
    </div>
  );
}

export default LogisticaPage;