import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// AGREGAMOS FaEdit A LOS ICONOS
import { FaMapMarkedAlt, FaRoute, FaTruckLoading, FaHistory, FaUserCheck, FaBoxOpen, FaEye, FaTrash, FaTimes, FaEdit } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import './LogisticaPage.css';

// Fix iconos
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const centroCochabamba = [-17.393879, -66.156944];

const RenderProductos = ({ detalles }) => (
  <ul className="product-list-mini">
    {detalles.map((d, i) => (
      <li key={i}>{d.cantidad}x {d.nombre_producto}</li>
    ))}
  </ul>
);

function LogisticaPage() {
  const [pedidos, setPedidos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState([]); 
  const [conductorSeleccionado, setConductorSeleccionado] = useState('');
  
  // Estados Modal
  const [pedidoVer, setPedidoVer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiClient.get('/pedidos/'),
      apiClient.get('/conductores/')
    ])
      .then(([responsePedidos, responseConductores]) => {
        setPedidos(responsePedidos.data);
        setConductores(responseConductores.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al cargar datos:", error);
        setLoading(false);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeletePedido = (id) => {
    if(window.confirm("¿Estás seguro de eliminar este pedido? Se borrará permanentemente.")) {
        apiClient.delete(`/pedidos/${id}/`)
            .then(() => {
                // Si estaba seleccionado, lo quitamos
                if(pedidosSeleccionados.includes(id)) {
                    handleTogglePedido(id);
                }
                fetchData(); // Recargamos
                // Si el modal estaba abierto con este pedido, lo cerramos
                if (pedidoVer && pedidoVer.id === id) cerrarModal();
            })
            .catch(err => alert("Error al eliminar pedido"));
    }
  };

  const handleVerDetalles = (pedido) => {
    setPedidoVer(pedido);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setPedidoVer(null);
  };

  const handleAsignarRuta = (event) => {
    event.preventDefault();
    if (pedidosSeleccionados.length === 0) { alert("Seleccione al menos un pedido."); return; }
    if (!conductorSeleccionado) { alert("Seleccione un conductor."); return; }

    const datosAsignacion = {
      conductor_id: conductorSeleccionado,
      pedido_ids: pedidosSeleccionados
    };

    apiClient.post('/logistica/asignar-ruta/', datosAsignacion)
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

  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
  const pedidosEnCamino = pedidos.filter(p => p.estado === 'en_camino');
  const pedidosEntregados = pedidos.filter(p => p.estado === 'entregado').slice(0, 5);
  const listaConductores = conductores; 

  if (loading) return <div className="page-container"><h2>Cargando panel...</h2></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Dashboard de Logística</h1>
        <p style={{color: '#666'}}>Gestión de rutas y monitoreo en tiempo real</p>
      </header>

      <main className="logistica-dashboard">
        
        {/* TARJETA 1: MAPA GLOBAL */}
        <section className="content-card span-2 map-section">
          <h2 className="section-title"><FaMapMarkedAlt /> Mapa de Operaciones</h2>
          <div className="map-container-wrapper">
            <MapContainer center={centroCochabamba} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {pedidosEnCamino.map(pedido => (
                pedido.latitud && (
                  <Marker 
                    key={pedido.id} 
                    position={[pedido.latitud, pedido.longitud]}
                    eventHandlers={{
                      click: () => {
                        handleVerDetalles(pedido);
                      },
                    }}
                  >
                    {/* El popup es opcional si usas el modal al hacer click */}
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
          <p style={{fontSize: '0.8rem', color: '#666', marginTop: '10px'}}>* Haz clic en un marcador para ver detalles.</p>
        </section>

        {/* TARJETA 2: ASIGNACIÓN */}
        <section className="content-card assign-route-section">
          <h2 className="section-title"><FaRoute /> Asignar Ruta</h2>
          <form onSubmit={handleAsignarRuta} className="assign-route-form">
            
            <div className="form-group">
              <label className="form-label"><FaBoxOpen /> 1. Pedidos Pendientes ({pedidosPendientes.length})</label>
              <div className="scrollable-list-container">
                {pedidosPendientes.length === 0 ? (
                  <div className="empty-list-message">Sin pendientes.</div>
                ) : (
                  <ul className="data-list">
                    {pedidosPendientes.map(pedido => (
                      <li key={pedido.id} className="data-item">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                            <label className="checkbox-label" style={{flex: 1}}>
                            <input
                                type="checkbox"
                                checked={pedidosSeleccionados.includes(pedido.id)}
                                onChange={() => handleTogglePedido(pedido.id)}
                            />
                            <span><strong>#{pedido.id}</strong> <small>(Cte. {pedido.cliente})</small></span>
                            </label>
                            
                            {/* BOTONES EN LA LISTA PENDIENTE */}
                            <div className="action-buttons">
                                <button type="button" className="btn-icon-action btn-view" onClick={() => handleVerDetalles(pedido)} title="Ver Mapa">
                                    <FaEye />
                                </button>
                                <button type="button" className="btn-icon-action btn-delete-mini" onClick={() => handleDeletePedido(pedido.id)} title="Borrar">
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label"><FaUserCheck /> 2. Conductor</label>
              <select className="form-select" value={conductorSeleccionado} onChange={e => setConductorSeleccionado(e.target.value)}>
                <option value="">-- Seleccione --</option>
                {listaConductores.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.estado.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary width-100">
              <FiSend /> ASIGNAR AHORA
            </button>
          </form>
        </section>

        {/* TARJETA 3: TABLA EN CURSO (ACTUALIZADA) */}
        <section className="content-card span-3 en-route-section">
          <h2 className="section-title"><FaTruckLoading /> Envíos en Curso</h2>
          
             {pedidosEnCamino.length === 0 ? (
            <p className="empty-table-message">No hay unidades en ruta.</p>
          ) : (
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Conductor</th>
                    <th>Carga</th>
                    <th>Estado</th>
                    <th style={{textAlign: 'center'}}>Acciones</th> {/* COLUMNA NUEVA */}
                  </tr>
                </thead>
                <tbody>
                  {pedidosEnCamino.map(pedido => (
                    <tr key={pedido.id}>
                      <td><strong>#{pedido.id}</strong><br /><small>Cliente: {pedido.cliente}</small></td>
                      <td className="driver-name">{pedido.conductor_asignado || '---'}</td>
                      <td><RenderProductos detalles={pedido.detalles} /></td>
                      <td><span className="status-badge status-en-camino">En Camino</span></td>
                      
                      {/* BOTONES DE ACCIÓN EN LA TABLA */}
                      <td style={{textAlign: 'center'}}>
                        <div className="action-buttons" style={{justifyContent: 'center'}}>
                            {/* Ver Mapa */}
                            <button className="btn-icon-action btn-view" onClick={() => handleVerDetalles(pedido)} title="Ver ubicación">
                                <FaEye />
                            </button>
                            
                            {/* Editar (Por ahora solo visual, redirige o alerta) */}
                            <button className="btn-icon-action" onClick={() => alert("Función de editar en desarrollo")} title="Editar Pedido">
                                <FaEdit style={{color: '#f39c12'}}/>
                            </button>

                            {/* Eliminar */}
                            <button className="btn-icon-action btn-delete-mini" onClick={() => handleDeletePedido(pedido.id)} title="Eliminar">
                                <FaTrash />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>

      {/* --- VENTANA MODAL (POPUP) CON MAPA Y DATOS --- */}
      {showModal && pedidoVer && (
        <div className="modal-overlay" onClick={cerrarModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Detalle del Pedido #{pedidoVer.id}</h2>
                    <button className="modal-close" onClick={cerrarModal}><FaTimes /></button>
                </div>
                
                <div className="modal-body">
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                        {/* Lado Izquierdo: Datos */}
                       {/* Lado Izquierdo del Modal: Datos Completos */}
                          <div>
                              <h3 style={{marginTop: 0, color: '#003DA5'}}>Datos de Entrega</h3>
                              
                              <div style={{background: '#f0f4ff', padding: '15px', borderRadius: '8px', marginBottom: '15px'}}>
                                  <p style={{margin: '5px 0'}}>
                                      <strong>Cliente:</strong> {pedidoVer.nombre_cliente || 'Sin Nombre'}
                                  </p>
                                  <p style={{margin: '5px 0'}}>
                                      <strong>Teléfono:</strong> {pedidoVer.telefono_cliente || 'Sin Teléfono'}
                                  </p>
                                  <p style={{margin: '5px 0', fontSize: '0.9rem', color: '#666'}}>
                                      (ID Sistema: {pedidoVer.cliente})
                                  </p>
                              </div>

                              <p><strong>Estado:</strong> 
                                  <span style={{
                                      marginLeft: '10px',
                                      padding: '4px 10px', 
                                      borderRadius: '12px',
                                      background: pedidoVer.estado === 'entregado' ? '#d4edda' : '#fff3cd',
                                      color: pedidoVer.estado === 'entregado' ? '#155724' : '#856404',
                                      fontWeight: 'bold',
                                      textTransform: 'uppercase'
                                  }}>
                                      {pedidoVer.estado}
                                  </span>
                              </p>
                              
                              <hr/>
                              
                              <p><strong>Productos Solicitados:</strong></p>
                              <div style={{background: '#f9f9f9', padding: '10px', borderRadius: '8px', border: '1px solid #eee'}}>
                                  <RenderProductos detalles={pedidoVer.detalles} />
                              </div>
                          </div>
                        
                        {/* Lado Derecho: Mapa Individual */}
                        <div>
                           <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Ubicación de Entrega:</label>
                           <div style={{height: '250px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '2px solid #eee'}}>
                                {pedidoVer.latitud ? (
                                    <MapContainer center={[pedidoVer.latitud, pedidoVer.longitud]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker position={[pedidoVer.latitud, pedidoVer.longitud]} />
                                    </MapContainer>
                                ) : (
                                    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', color: '#666'}}>
                                        <p>Sin ubicación GPS registrada</p>
                                    </div>
                                )}
                           </div>
                           {pedidoVer.latitud && (
                               <p style={{fontSize: '0.8rem', color: '#28a745', marginTop: '5px'}}>📍 {pedidoVer.latitud}, {pedidoVer.longitud}</p>
                           )}
                        </div>
                    </div>
                    
                    {/* Pie del Modal */}
                    <div style={{textAlign: 'right', marginTop: '20px'}}>
                        <button className="btn btn-danger" onClick={() => handleDeletePedido(pedidoVer.id)}>
                            ELIMINAR ESTE PEDIDO
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

export default LogisticaPage;