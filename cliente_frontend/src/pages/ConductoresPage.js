import React, { useState, useEffect } from 'react';
import apiClient from '../api'; // <-- ¡Correcto!

// URL de la API (relativa, la base está en api.js)
const API_URL = '/conductores/'; // <-- ¡Correcto!

function ConductoresPage() {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [licencia, setLicencia] = useState('');

  useEffect(() => {
    fetchConductores();
  }, []);

  const fetchConductores = () => {
    // --- CAMBIO 1 ---
    // Era .post() sin URL, debe ser .get(API_URL) para obtener los datos
    apiClient.get(API_URL)
      .then(response => {
        setConductores(response.data);  
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al obtener conductores!", error);
        setLoading(false);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!nombre || !licencia) {
      alert("Por favor, completa ambos campos.");
      return;
    }
    const nuevoConductor = {
      nombre: nombre,
      licencia: licencia,
      estado: 'disponible'
    };

    // --- CAMBIO 2 ---
    // Era axios.post(...), debe ser apiClient.post(...)
    // para que envíe el token de autenticación.
    apiClient.post(API_URL, nuevoConductor)
      .then(response => {
        // Actualiza la lista sin recargar la página
        setConductores([...conductores, response.data]);
        setNombre('');
        setLicencia('');
      })
      .catch(error => {
        console.error("¡Error al crear el conductor!", error);
        if (error.response) {
            alert(`Error al crear conductor: ${JSON.stringify(error.response.data)}`);
        }
      });
  };

  if (loading) return <h1>Cargando conductores...</h1>;

  // El return (JSX) está perfecto, no necesita cambios
  return (
    <div className="page-container"> {/* Contenedor principal */}
      
      <div className="content-card">
        <h1 className="page-title">Gestión de Conductores</h1>
        
        {/* Formulario Estilizado */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre Completo:</label>
            <input
              type="text"
              className="form-input" // Clase nueva
              placeholder="Ej. Juan Pérez"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">N° de Licencia:</label>
            <input
              type="text"
              className="form-input" // Clase nueva
              placeholder="Ej. 1234567 LP"
              value={licencia}
              onChange={e => setLicencia(e.target.value)}
            />
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary">
              Guardar Conductor
            </button>
          </div>
        </form>
      </div>

      {/* Lista Estilizada */}
      <div className="content-card">
        <h2 className="section-title">Conductores Registrados</h2>
        
        {conductores.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>No hay conductores registrados aún.</p>
        ) : (
          <ul className="data-list">
            {conductores.map(conductor => (
              <li key={conductor.id} className="data-item">
                <div>
                  <strong>{conductor.nombre}</strong>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Licencia: {conductor.licencia}</div>
                </div>
                <span style={{ 
                  padding: '5px 10px', 
                  borderRadius: '15px', 
                  fontSize: '0.8rem',
                  backgroundColor: conductor.estado === 'disponible' ? '#d4edda' : '#f8d7da',
                  color: conductor.estado === 'disponible' ? '#155724' : '#721c24'
                }}>
                  {conductor.estado}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );  
}

export default ConductoresPage;