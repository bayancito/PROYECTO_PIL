import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { useNavigate, useParams } from 'react-router-dom';

function EditarConductorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [licencia, setLicencia] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/conductores/${id}/`)
      .then(res => {
        setNombre(res.data.nombre);
        setLicencia(res.data.licencia);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert("Error al cargar conductor.");
        navigate('/conductores');
      });
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/conductores/${id}/`, { nombre, licencia });
      alert('¡Conductor actualizado!');
      navigate('/conductores');
    } catch (error) {
      alert('Error al guardar cambios.');
    }
  };

  if (loading) return <div className="page-container"><h2>Cargando...</h2></div>;

  return (
    <div className="page-container">
      <div className="content-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 className="page-title">Editar Conductor</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input className="form-input" value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Licencia</label>
            <input className="form-input" value={licencia} onChange={e => setLicencia(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditarConductorPage;