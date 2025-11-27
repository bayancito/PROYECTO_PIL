import React, { useState } from 'react';
import apiClient from '../api';
import { useNavigate } from 'react-router-dom';

function IncidenciaPage() {
  const [tipo, setTipo] = useState('Trafico');
  const [descripcion, setDescripcion] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!descripcion) { alert("Por favor describe el problema."); return; }

    apiClient.post('/conductor/incidencia/', { tipo, descripcion })
      .then(() => {
        alert("Reporte enviado a central.");
        navigate('/');
      })
      .catch(err => alert("Error al enviar reporte."));
  };

  return (
    <div className="page-container">
      <div className="content-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 className="page-title" style={{ color: '#e74c3c' }}>Reportar Problema</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Notifica a la central sobre cualquier retraso o incidente.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tipo de Incidencia</label>
            <select className="form-select" value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="Trafico">Tráfico / Bloqueo</option>
              <option value="Mecanico">Falla Mecánica</option>
              <option value="Cliente">Cliente Ausente / No Recibe</option>
              <option value="Accidente">Accidente</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción del suceso</label>
            <textarea 
              className="form-input" 
              rows="4" 
              value={descripcion} 
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Describe brevemente qué pasó..."
            ></textarea>
          </div>

          <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>
            ENVIAR REPORTE
          </button>
        </form>
      </div>
    </div>
  );
}

export default IncidenciaPage;
