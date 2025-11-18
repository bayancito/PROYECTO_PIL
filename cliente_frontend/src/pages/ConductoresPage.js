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
    <div>
      {/* --- Formulario de Conductores --- */}
      <h2>Añadir Nuevo Conductor</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre: </label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </div>
        <div>
          <label>Licencia: </label>
          <input
            type="text"
            value={licencia}
            onChange={e => setLicencia(e.target.value)}
          />
        </div>
        <button type="submit">Guardar Conductor</button>
      </form>

      <hr style={{ margin: '40px 0' }} />

      {/* --- Lista de Conductores --- */}
      <h1>Lista de Conductores</h1>
      <ul>
        {conductores.map(conductor => (
          <li key={conductor.id}>
            <strong>{conductor.nombre}</strong> - Licencia: {conductor.licencia}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConductoresPage;