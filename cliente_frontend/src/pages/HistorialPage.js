import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { FaBoxOpen, FaUser, FaMapMarkerAlt } from 'react-icons/fa';

function HistorialPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/conductor/historial/')
      .then(res => {
        setPedidos(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="page-container"><h2>Cargando historial...</h2></div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Historial de Entregas</h1>
      
      {pedidos.length === 0 ? (
        <div className="content-card" style={{textAlign: 'center'}}>
          <p>Aún no has realizado entregas.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {pedidos.map(pedido => (
            <div key={pedido.id} className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '5px solid #28a745' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#333' }}>Pedido #{pedido.id}</h3>
                <span style={{ background: '#d4edda', color: '#155724', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  ENTREGADO
                </span>
              </div>
              
              <div style={{ color: '#666', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <FaUser /> {pedido.nombre_cliente}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaMapMarkerAlt /> {pedido.direccion_texto || 'Ubicación mapa'}
                </div>
              </div>

              <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                {pedido.detalles.map((d, i) => (
                  <div key={i} style={{ fontSize: '0.9rem' }}>
                    {d.cantidad}x {d.nombre_producto}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistorialPage;