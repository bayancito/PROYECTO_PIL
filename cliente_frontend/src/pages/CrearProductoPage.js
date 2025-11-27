// En: src/pages/CrearProductoPage.js

import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { useNavigate } from 'react-router-dom';

// (Opcional) Si quieres cargar categorías para un select, 
// podrías hacer otro fetch aquí. Por ahora lo haremos simple.

function CrearProductoPage() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagen, setImagen] = useState(null); // Estado para el archivo de imagen
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. IMPORTANTE: Para subir archivos, usamos FormData en lugar de JSON
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('precio', precio);
    
    // Solo adjuntamos la imagen si el usuario seleccionó una
    if (imagen) {
      formData.append('imagen', imagen);
    }

    try {
      // Axios detecta el FormData y configura los headers automáticamente
      await apiClient.post('/productos/', formData);
      
      alert('¡Producto creado con éxito!');
      navigate('/productos'); // Nos devuelve al catálogo
    } catch (error) {
      console.error("Error al crear producto:", error);
      alert('Hubo un error al crear el producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 className="page-title" style={{ fontSize: '1.8rem' }}>Nuevo Producto</h1>
        
        <form onSubmit={handleSubmit}>
          
          {/* Nombre */}
          <div className="form-group">
            <label className="form-label">Nombre del Producto *</label>
            <input 
              type="text" 
              className="form-input" 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
              required 
              placeholder="Ej. Leche Entera 1L"
            />
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea 
              className="form-input" 
              rows="3"
              value={descripcion} 
              onChange={e => setDescripcion(e.target.value)} 
              placeholder="Detalles del producto..."
            />
          </div>

          {/* Precio */}
          <div className="form-group">
            <label className="form-label">Precio (Bs.) *</label>
            <input 
              type="number" 
              step="0.50" // Permite decimales
              className="form-input" 
              value={precio} 
              onChange={e => setPrecio(e.target.value)} 
              required 
              placeholder="0.00"
            />
          </div>

          {/* Imagen */}
          <div className="form-group">
            <label className="form-label">Imagen del Producto</label>
            <div style={{ border: '2px dashed #ccc', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setImagen(e.target.files[0])} 
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload" className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-block', margin: 0 }}>
                {imagen ? 'Cambiar Imagen' : 'Seleccionar Foto'}
              </label>
              {imagen && <p style={{ marginTop: '10px', color: '#28a745' }}>Archivo seleccionado: {imagen.name}</p>}
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button type="button" onClick={() => navigate('/productos')} className="btn" style={{ background: '#ccc', color: '#333' }}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Guardando...' : 'GUARDAR PRODUCTO'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CrearProductoPage;