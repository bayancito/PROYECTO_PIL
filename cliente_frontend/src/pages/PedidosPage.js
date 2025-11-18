import React, { useState, useEffect } from 'react'; 
// --- CAMBIO 1 ---
// import axios from 'axios'; // Ya no usamos axios directamente
import apiClient from '../api'; // Usamos nuestra instancia 'apiClient'

// --- ¡NUEVAS IMPORTACIONES PARA EL MAPA! ---
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// (Arreglo del ícono de Leaflet)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
// ------------------------------------------

// --- CAMBIO 2 ---
// URLs relativas (la base está en api.js)
const API_CLIENTES = '/clientes/';
const API_PRODUCTOS = '/productos/';
const API_PEDIDOS = '/pedidos/';

// --- Componente interno (sin cambios) ---
function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });
  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}
// ----------------------------------------------------


function PedidosPage() {
  // (Estados... sin cambios)
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
      // --- CAMBIO 3 ---
      apiClient.get(API_CLIENTES), // Era axios.get
      apiClient.get(API_PRODUCTOS) // Era axios.get
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
      console.error("Error al cargar datos iniciales:", error);
      setLoading(false);
    });
  }, []);

  // (handleAñadirProducto... sin cambios, no usa axios)
  const handleAñadirProducto = () => {
    // ... (lógica del carrito) ...
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
    
    // (Validaciones... sin cambios)
    if (!ubicacion) {
      alert("Por favor, seleccione una ubicación en el mapa.");
      return;
    }
    if (!clienteSeleccionado) {
      alert("Por favor, seleccione un cliente.");
      return;
    }
    if (carrito.length === 0) {
      alert("Añada al menos un producto al pedido.");
      return;
    }

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

    // Enviamos a la API de Pedidos
    // --- CAMBIO 4 ---
    apiClient.post(API_PEDIDOS, nuevoPedido) // Era axios.post
      .then(response => {
        alert("¡Pedido guardado con éxito!");
        setClienteSeleccionado('');
        setCarrito([]);
        setUbicacion(null); 
        // (Aquí podríamos resetear el marcador del mapa, 
        //  pero eso requiere más lógica, así que lo dejamos)
      })
      .catch(error => {
          // (El 'alert' mejorado se queda)
          console.error("¡Error al guardar el pedido!");
          if (error.response) {
            console.error("Respuesta del backend (error):", error.response.data);
            const errorMsg = JSON.stringify(error.response.data);
            alert(`Hubo un error al guardar: ${errorMsg}`);
          } else {
            console.error("Error desconocido:", error.message);
            alert("Hubo un error desconocido. Revisa la consola (F12).");
          }
        });
  };

  const centroCochabamba = [-17.393879, -66.156944];

  if (loading) {
    return <h2>Cargando datos del formulario...</h2>;
  }

  // (El return con el JSX/HTML... sin cambios)
  return (
    <div>
      <h2>Crear Nuevo Pedido</h2>
      <form onSubmit={handleGuardarPedido}>
        
        {/* --- PASO 1: Selector de Clientes --- */}
        <div>
          <label>Cliente: </label>
          <select 
            value={clienteSeleccionado} 
            onChange={e => setClienteSeleccionado(e.target.value)} 
          >
            <option value="">Seleccione un cliente...</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre_cliente}
              </option>
            ))}
          </select>
        </div>

        {/* --- MAPA --- */}
        <div style={{ margin: '20px 0' }}>
          <label>Ubicación de entrega (haz clic en el mapa):</label>
          <MapContainer 
            center={centroCochabamba} 
            zoom={13} 
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker onLocationSelect={setUbicacion} />
          </MapContainer>
          {ubicacion && (
            <p>Ubicación seleccionada: {ubicacion.lat.toFixed(4)}, {ubicacion.lng.toFixed(4)}</p>
          )}
        </div>

        {/* --- PASO 2: Añadir Productos --- */}
        <hr />
        <div>
          <label>Producto: </label>
          <select 
            value={productoSeleccionado} 
            onChange={e => setProductoSeleccionado(e.target.value)} 
          >
            <option value="">Seleccione un producto...</option>
            {productos.map(producto => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} (${producto.precio})
              </option>
            ))}
          </select>
          <input 
            type="number" 
            placeholder="Cantidad" 
            style={{ marginLeft: '10px', width: '80px' }} 
            value={cantidad} 
            onChange={e => setCantidad(e.target.value)} 
          />
          <button 
            type="button" 
            style={{ marginLeft: '10px' }}
            onClick={handleAñadirProducto} 
          >
            Añadir al Pedido
          </button>
        </div>

        {/* --- PASO 3: Carrito --- */}
        <hr />
        <h3>Productos en el Pedido</h3>
        <ul>
          {carrito.length === 0 ? (
            <li>(Aún no hay productos)</li>
          ) : (
            carrito.map((item, index) => (
              <li key={index}>
                {item.cantidad} x {item.nombre} (@ ${item.precio} c/u)
              </li>
            ))
          )}
        </ul>

        <button type="submit">
          Guardar Pedido Completo
        </button>
      </form>
    </div>
  );
}

export default PedidosPage;