import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// ... (tus importaciones de iconos siguen igual) ...
import { FaBoxOpen, FaUser, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaDirections } from 'react-icons/fa';

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
  const [rutaPolilinea, setRutaPolilinea] = useState([]); // Estado para la línea de calle

  const fetchRuta = () => {
    setLoading(true);
    apiClient.get('/mi-ruta/')
      .then(response => {
        setDatosRuta(response.data);
        setLoading(false);
        // Una vez tenemos los datos, calculamos la ruta visual
        if (response.data && response.data.pedidos) {
           calcularRutaCalles(response.data);
        }
      })
      .catch(err => {
        console.error(err);
        setError("No se pudo cargar la ruta.");
        setLoading(false);
      });
  };

  // --- FUNCIÓN PARA OBTENER LA RUTA POR CALLES (OSRM) ---
  const calcularRutaCalles = async (data) => {
    const origen = data.origen;
    const pedidos = data.pedidos || [];
    
    if (pedidos.length === 0) return;

    // Construimos la URL de coordenadas: longitud,latitud;longitud,latitud...
    // OSRM usa formato: lon,lat
    let coordenadasStr = `${origen.lng},${origen.lat}`;
    
    pedidos.forEach(p => {
        if(p.latitud && p.longitud) {
            coordenadasStr += `;${p.longitud},${p.latitud}`;
        }
    });

    // Llamada a la API pública de OSRM (Gratuita para demos)
    const url = `https://router.project-osrm.org/route/v1/driving/${coordenadasStr}?overview=full&geometries=geojson`;

    try {
        const response = await fetch(url);
        const json = await response.json();
        
        if (json.code === 'Ok' && json.routes.length > 0) {
            // OSRM devuelve [lon, lat], Leaflet necesita [lat, lon]. Invertimos.
            const geometria = json.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setRutaPolilinea(geometria);
        }
    } catch (error) {
        console.error("Error calculando ruta visual:", error);
        // Fallback: Si falla OSRM, usamos línea recta
        const lineaRecta = [
            [origen.lat, origen.lng],
            ...pedidos.map(p => [p.latitud, p.longitud])
        ];
        setRutaPolilinea(lineaRecta);
    }
  };

  useEffect(() => {
    fetchRuta();
  }, []);

  const marcarEntregado = (pedidoId) => {
    if (!window.confirm("¿Confirmar entrega y pago del pedido?")) return;

    apiClient.patch(`/pedidos/${pedidoId}/`, { estado: 'entregado' })
      .then(() => {
        alert("¡Entrega registrada!");
        fetchRuta(); 
      })
      .catch(err => {
        alert("Error al actualizar");
        console.error(err);
      });
  };

  const abrirGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  if (loading) return <div className="page-container"><h2>Cargando ruta...</h2></div>;
  if (error) return <div className="page-container"><h2 style={{color: 'red'}}>{error}</h2></div>;
  
  if (datosRuta && datosRuta.mensaje) {
    return (
      <div className="page-container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <div className="content-card">
          <h2 style={{ color: '#28a745' }}>🎉 ¡Ruta Completada!</h2>
          <p style={{ fontSize: '1.2rem' }}>{datosRuta.mensaje}</p>
        </div>
      </div>
    );
  }

  const pedidos = datosRuta.pedidos || [];

  return (
    <div className="page-container">
      <h1 className="page-title">Hola, {datosRuta.conductor}</h1>
      
      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Mapa de Ruta</h2>
          <span style={{ background: '#eef2ff', padding: '5px 10px', borderRadius: '15px', color: '#003DA5', fontWeight: 'bold' }}>
            {pedidos.length} Paradas Pendientes
          </span>
        </div>
        
        <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd' }}>
          <MapContainer center={centroCochabamba} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* DIBUJAMOS LA RUTA DE CALLES */}
            {rutaPolilinea.length > 0 && (
                <Polyline positions={rutaPolilinea} color="#003DA5" weight={5} opacity={0.8} />
            )}

            {/* Marcador de Fábrica */}
            <Marker position={[datosRuta.origen.lat, datosRuta.origen.lng]}>
              <Popup>🏭 Fábrica PIL (Inicio)</Popup>
            </Marker>

            {/* Marcadores de Pedidos */}
            {pedidos.map((pedido, index) => (
              pedido.latitud && (
                <Marker key={pedido.id} position={[pedido.latitud, pedido.longitud]}>
                  <Popup>
                    <b>Parada #{index + 1}</b><br />
                    Cliente: {pedido.nombre_cliente}
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      </div>

      {/* LISTA DE ENTREGAS */}
      <h3 style={{ margin: '30px 0 15px 0', color: '#555' }}>Detalle de Entregas</h3>
      
      <div style={{ display: 'grid', gap: '25px' }}>
        {pedidos.map((pedido, index) => (
          <div key={pedido.id} className="content-card" style={{ marginBottom: '0', borderLeft: '6px solid #003DA5', padding: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.3rem', color: '#003DA5' }}>Parada #{index + 1}</h4>
                <span style={{ fontSize: '0.9rem', color: '#777' }}>ID Pedido: {pedido.id}</span>
              </div>
              <button 
                onClick={() => abrirGoogleMaps(pedido.latitud, pedido.longitud)}
                className="btn"
                style={{ backgroundColor: '#4285F4', color: 'white', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <FaDirections /> GPS
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <p style={{ margin: '0 0 5px 0', color: '#999', fontSize: '0.8rem', fontWeight: 'bold' }}>CLIENTE</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaUser style={{ color: '#555' }} />
                  <strong>{pedido.nombre_cliente}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                  <FaPhone style={{ color: '#555' }} />
                  <span>{pedido.telefono_cliente || 'Sin teléfono'}</span>
                </div>
              </div>
              <div>
                <p style={{ margin: '0 0 5px 0', color: '#999', fontSize: '0.8rem', fontWeight: 'bold' }}>DIRECCIÓN</p>
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                  <FaMapMarkerAlt style={{ color: '#555', marginTop: '3px' }} />
                  <span>{pedido.direccion_texto || 'Ubicación en mapa'}</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 10px 0', color: '#999', fontSize: '0.8rem', fontWeight: 'bold' }}>CARGA A ENTREGAR</p>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {pedido.detalles.map((d, i) => (
                  <li key={i} style={{ marginBottom: '5px' }}>
                    <strong>{d.cantidad}x</strong> {d.nombre_producto} 
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => marcarEntregado(pedido.id)}
              className="btn btn-success" 
              style={{ width: '100%', padding: '15px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
              <FaCheckCircle /> CONFIRMAR ENTREGA
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MiRutaPage;