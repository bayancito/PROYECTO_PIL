import React, { useState, useEffect } from 'react'; 
import apiClient from '../api'; 
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../GeneralStyles.css'; // Asegúrate de que la ruta sea correcta

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

// Componente para mover el mapa
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
    }
  }, [center, map]);
  return null;
}

function LocationMarker({ onLocationSelect, position }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return position ? <Marker position={position}></Marker> : null;
}

function PedidosPage() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del formulario
  const [esClienteNuevo, setEsClienteNuevo] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  
  // Estados del producto y carrito
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1); 
  const [carrito, setCarrito] = useState([]); 
  
  const [ubicacion, setUbicacion] = useState(null); 

  // --- FUNCIÓN PARA RECARGAR DATOS (Útil después de crear un cliente nuevo) ---
  const cargarDatos = () => {
    Promise.all([
      apiClient.get(API_CLIENTES),
      apiClient.get(API_PRODUCTOS)
    ])
    .then(([responseClientes, responseProductos]) => {
      setClientes(responseClientes.data);
      setProductos(responseProductos.data);
      setLoading(false); 
      if (responseProductos.data.length > 0 && !productoSeleccionado) {
        setProductoSeleccionado(responseProductos.data[0].id);
      }
    })
    .catch(error => {
      console.error("Error:", error);
      setLoading(false);
    });
  };

  useEffect(() => { cargarDatos(); }, []);

  // --- LÓGICA INTELIGENTE: AL SELECCIONAR CLIENTE ---
  const handleSelectCliente = (e) => {
    const idCliente = e.target.value;
    setClienteSeleccionado(idCliente);

    if (idCliente) {
      const clienteEncontrado = clientes.find(c => c.id === parseInt(idCliente));
      
      // Si el cliente tiene ubicación guardada, movemos el mapa
      if (clienteEncontrado && clienteEncontrado.latitud && clienteEncontrado.longitud) {
        console.log("Ubicación encontrada para cliente:", clienteEncontrado.latitud, clienteEncontrado.longitud);
        setUbicacion({
          lat: parseFloat(clienteEncontrado.latitud),
          lng: parseFloat(clienteEncontrado.longitud)
        });
      } else {
        // Si no tiene ubicación, no hacemos nada (o podríamos limpiar el mapa)
        // setUbicacion(null); 
      }
    } else {
        setUbicacion(null);
    }
  };

  const handleAñadirProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) {
      alert("Seleccione producto y cantidad."); return;
    }
    const productoEncontrado = productos.find(p => p.id === parseInt(productoSeleccionado));
    if (!productoEncontrado) return;

    const nuevoItem = {
      productoId: productoEncontrado.id,
      nombre: productoEncontrado.nombre,
      precio: productoEncontrado.precio,
      cantidad: parseInt(cantidad),
      subtotal: parseFloat(productoEncontrado.precio) * parseInt(cantidad)
    };
    setCarrito([...carrito, nuevoItem]);
    setCantidad(1);
  };
  
  const handleGuardarPedido = (event) => {
    event.preventDefault(); 
    
    if (!ubicacion) { alert("Seleccione ubicación en el mapa."); return; }
    if (carrito.length === 0) { alert("El carrito está vacío."); return; }
    if (!esClienteNuevo && !clienteSeleccionado) { alert("Seleccione un cliente."); return; }
    if (esClienteNuevo && !nuevoNombre) { alert("Escriba el nombre del cliente."); return; }

    const detallesFormateados = carrito.map(item => ({
      producto: item.productoId,
      cantidad: item.cantidad,
      precio_unitario: item.precio 
    }));

    const nuevoPedido = {
      estado: 'pendiente', 
      detalles: detallesFormateados,
      latitud: parseFloat(ubicacion.lat.toFixed(6)),
      longitud: parseFloat(ubicacion.lng.toFixed(6)),
      
      ...(esClienteNuevo ? {
          nombre_nuevo_cliente: nuevoNombre,
          telefono_nuevo_cliente: nuevoTelefono,
          cliente: null 
      } : {
          cliente: clienteSeleccionado
      })
    };

    apiClient.post(API_PEDIDOS, nuevoPedido)
      .then(response => {
        alert("¡Pedido creado exitosamente!");
        // Si creamos cliente nuevo, recargamos la lista para que aparezca la próxima vez
        if (esClienteNuevo) cargarDatos(); 
        
        // --- LIMPIEZA TOTAL ---
        handleCancelar(); 
      })
      .catch(error => {
        console.error("Error:", error);
        if(error.response) alert(`Error: ${JSON.stringify(error.response.data)}`);
        else alert("Error de conexión.");
      });
  };

  // Función para limpiar TODO el formulario
  const handleCancelar = () => {
    setClienteSeleccionado('');
    setNuevoNombre('');
    setNuevoTelefono('');
    setCarrito([]); // Esto limpia el resumen
    setUbicacion(null);
    setCantidad(1);
    setEsClienteNuevo(false);
    if (productos.length > 0) setProductoSeleccionado(productos[0].id);
  };

  const centroCochabamba = [-17.393879, -66.156944];

  if (loading) return <div className="page-container"><h2>Cargando...</h2></div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Nuevo Pedido</h1>
      
      <div className="content-card">
        <h2 className="section-title">1. Datos del Cliente</h2>
        
        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
                type="checkbox" 
                id="checkNuevo" 
                checked={esClienteNuevo} 
                onChange={(e) => {
                  setEsClienteNuevo(e.target.checked);
                  setClienteSeleccionado('');
                  if(!e.target.checked) setUbicacion(null); 
                }}
                style={{ transform: 'scale(1.5)' }}
            />
            <label htmlFor="checkNuevo" style={{ fontSize: '1rem', cursor: 'pointer', color: '#003DA5', fontWeight: 'bold' }}>
                ¿Es un Cliente Nuevo?
            </label>
        </div>

        {!esClienteNuevo ? (
            <div className="form-group">
                <label className="form-label">Buscar Cliente Registrado:</label>
                <select 
                    className="form-select" 
                    value={clienteSeleccionado} 
                    onChange={handleSelectCliente} 
                >
                    <option value="">-- Seleccione --</option>
                    {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nombre_cliente}</option>
                    ))}
                </select>
            </div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                    <label className="form-label">Nombre del Cliente *</label>
                    <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Ej: Tienda Doña María"
                        value={nuevoNombre}
                        onChange={e => setNuevoNombre(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Ej: 77712345"
                        value={nuevoTelefono}
                        onChange={e => setNuevoTelefono(e.target.value)}
                    />
                </div>
            </div>
        )}

        <div className="form-group" style={{marginTop: '20px'}}>
          <label className="form-label">Ubicación de Entrega:</label>
          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '2px solid #eee', height: '300px' }}>
            <MapContainer center={centroCochabamba} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapUpdater center={ubicacion} />
              <LocationMarker onLocationSelect={setUbicacion} position={ubicacion} />
            </MapContainer>
          </div>
          {ubicacion ? 
            <p style={{ color: '#28a745', marginTop: '5px', fontWeight:'bold' }}>📍 Ubicación lista</p> :
            <p style={{ color: '#666', marginTop: '5px', fontSize:'0.9rem' }}>* Toque el mapa para marcar</p>
          }
        </div>
      </div>

      <div className="content-card">
        <h2 className="section-title">2. Agregar Productos</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2 }}>
            <label className="form-label">Producto:</label>
            <select className="form-select" value={productoSeleccionado} onChange={e => setProductoSeleccionado(e.target.value)}>
              {productos.map(p => (<option key={p.id} value={p.id}>{p.nombre} (Bs. {p.precio})</option>))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Cantidad:</label>
            <input type="number" className="form-input" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} />
          </div>
          <button type="button" className="btn btn-primary" onClick={handleAñadirProducto}>+ AÑADIR</button>
        </div>
      </div>

      {/* SECCIÓN DE RESUMEN (Solo visible si hay items) */}
      {carrito.length > 0 && (
        <div className="content-card">
          <h2 className="section-title">3. Resumen del Pedido</h2>
          <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                    <th style={{padding:'10px'}}>Prod</th>
                    <th style={{padding:'10px'}}>Cant</th>
                    <th style={{padding:'10px'}}>Total</th>
                </tr>
            </thead>
            <tbody>
              {carrito.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td style={{padding:'10px'}}>{item.nombre}</td>
                  <td style={{padding:'10px'}}>{item.cantidad}</td>
                  <td style={{padding:'10px', fontWeight:'bold'}}>Bs. {item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', paddingTop: '15px' }}>
            <button onClick={handleCancelar} className="btn btn-danger">CANCELAR</button>
            <button onClick={handleGuardarPedido} className="btn btn-success">CONFIRMAR PEDIDO</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PedidosPage;