import React, { useState, useEffect } from 'react'; 
import apiClient from '../api'; 
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix iconos Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_CLIENTES = '/clientes/';
const API_PRODUCTOS = '/productos/';
const API_PEDIDOS = '/pedidos/';

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

function PedidosPage() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1); 
  const [carrito, setCarrito] = useState([]); 
  const [ubicacion, setUbicacion] = useState(null); 

  useEffect(() => {
    Promise.all([
      apiClient.get(API_CLIENTES),
      apiClient.get(API_PRODUCTOS)
    ])
    .then(([responseClientes, responseProductos]) => {
      setClientes(responseClientes.data);
      setProductos(responseProductos.data);
      setLoading(false); 
      if (responseProductos.data.length > 0) {
        setProductoSeleccionado(responseProductos.data[0].id);
      }
    })
    .catch(error => {
      console.error("Error al cargar datos:", error);
      setLoading(false);
    });
  }, []);

  const handleAñadirProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) {
      alert("Seleccione un producto y una cantidad válida.");
      return;
    }
    const productoEncontrado = productos.find(p => p.id === parseInt(productoSeleccionado));
    if (!productoEncontrado) {
      alert("Producto no encontrado.");
      return;
    }
    const nuevoItemCarrito = {
      productoId: productoEncontrado.id,
      nombre: productoEncontrado.nombre,
      precio: productoEncontrado.precio,
      cantidad: parseInt(cantidad),
    };
    setCarrito([...carrito, nuevoItemCarrito]);
    setCantidad(1);
  };
  
  const handleGuardarPedido = (event) => {
    event.preventDefault(); 
    if (!ubicacion) { alert("Seleccione una ubicación en el mapa."); return; }
    if (!clienteSeleccionado) { alert("Seleccione un cliente."); return; }
    if (carrito.length === 0) { alert("Añada productos al pedido."); return; }

    const detallesFormateados = carrito.map(item => ({
      producto: item.productoId,
      cantidad: item.cantidad,
      precio_unitario: item.precio 
    }));

    const nuevoPedido = {
      cliente: clienteSeleccionado,
      estado: 'pendiente', 
      detalles: detallesFormateados,
      latitud: parseFloat(ubicacion.lat.toFixed(6)),
      longitud: parseFloat(ubicacion.lng.toFixed(6))
    };

    apiClient.post(API_PEDIDOS, nuevoPedido)
      .then(response => {
        alert("¡Pedido guardado con éxito!");
        setClienteSeleccionado('');
        setCarrito([]);
        setUbicacion(null);
      })
      .catch(error => {
        console.error("Error:", error);
        alert("Error al guardar el pedido.");
      });
  };

  const centroCochabamba = [-17.393879, -66.156944];

  if (loading) return <div className="page-container"><h2>Cargando...</h2></div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Crear Nuevo Pedido</h1>
      
      {/* TARJETA 1: Datos del Cliente y Mapa */}
      <div className="content-card">
        <h2 className="section-title">1. Ubicación y Cliente</h2>
        
        <div className="form-group">
          <label className="form-label">Seleccionar Cliente:</label>
          <select 
            className="form-select" // Clase estilizada
            value={clienteSeleccionado} 
            onChange={e => setClienteSeleccionado(e.target.value)} 
          >
            <option value="">-- Seleccione --</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nombre_cliente}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Ubicación de Entrega (Click en el mapa):</label>
          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '2px solid #eee' }}>
            <MapContainer center={centroCochabamba} zoom={13} style={{ height: '350px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker onLocationSelect={setUbicacion} />
            </MapContainer>
          </div>
          {ubicacion && (
            <p style={{ marginTop: '10px', color: '#28a745', fontWeight: 'bold' }}>
              📍 Ubicación seleccionada: {ubicacion.lat.toFixed(4)}, {ubicacion.lng.toFixed(4)}
            </p>
          )}
        </div>
      </div>

      {/* TARJETA 2: Productos */}
      <div className="content-card">
        <h2 className="section-title">2. Agregar Productos</h2>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2 }}>
            <label className="form-label">Producto:</label>
            <select 
              className="form-select" 
              value={productoSeleccionado} 
              onChange={e => setProductoSeleccionado(e.target.value)} 
            >
              <option value="">-- Producto --</option>
              {productos.map(producto => (
                <option key={producto.id} value={producto.id}>{producto.nombre} (${producto.precio})</option>
              ))}
            </select>
          </div>
          
          <div style={{ flex: 1 }}>
            <label className="form-label">Cantidad:</label>
            <input 
              type="number" 
              className="form-input"
              value={cantidad} 
              onChange={e => setCantidad(e.target.value)} 
            />
          </div>
          
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAñadirProducto}
            style={{ marginBottom: '2px' }}
          >
            + Añadir
          </button>
        </div>
      </div>

      {/* TARJETA 3: Resumen (Carrito) */}
      {carrito.length > 0 && (
        <div className="content-card">
          <h2 className="section-title">3. Resumen del Pedido</h2>
          <ul className="data-list">
            {carrito.map((item, index) => (
              <li key={index} className="data-item">
                <strong>{item.nombre}</strong>
                <span>{item.cantidad} x ${item.precio}</span>
              </li>
            ))}
          </ul>
          
          <div style={{ marginTop: '30px', textAlign: 'right' }}>
            <button onClick={handleGuardarPedido} className="btn btn-success">
              CONFIRMAR PEDIDO
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default PedidosPage;