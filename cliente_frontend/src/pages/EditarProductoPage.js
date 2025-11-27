// En: src/pages/EditarProductoPage.js

import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { useNavigate, useParams } from 'react-router-dom';

function EditarProductoPage() {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenActual, setImagenActual] = useState(null); // URL de la imagen existente
  const [imagenNueva, setImagenNueva] = useState(null);   // Archivo nuevo si se cambia
  const [loading, setLoading] = useState(true);

  // 1. Cargar los datos del producto al iniciar
  useEffect(() => {
    apiClient.get(`/productos/${id}/`)
      .then(response => {
        const data = response.data;
        setNombre(data.nombre);
        setDescripcion(data.descripcion);
        setPrecio(data.precio);
        setImagenActual(data.imagen);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al cargar producto:", error);
        alert("No se pudo cargar el producto.");
        navigate('/productos');
      });
  }, [id, navigate]);

  // 2. Manejar el guardado (Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('precio', precio);
    
    // Solo enviamos imagen si el usuario seleccionó una NUEVA
    if (imagenNueva) {
      formData.append('imagen', imagenNueva);
    }

    try {
      // Usamos .patch para actualizar (o .put)
      await apiClient.patch(`/productos/${id}/`, formData);
      alert('¡Producto actualizado correctamente!');
      navigate('/productos');
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert('Error al guardar los cambios.');
    }
  };

  if (loading) return <div className="page-container"><h2>Cargando datos...</h2></div>;

  return (
    <div className="page-container">
      <div className="content-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 className="page-title" style={{ fontSize: '1.8rem' }}>Editar Producto</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="form-input" value={nombre} onChange={e => setNombre(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-input" rows="3" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Precio (Bs.)</label>
            <input type="number" step="0.50" className="form-input" value={precio} onChange={e => setPrecio(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Imagen</label>
            
            {/* Mostrar imagen actual si existe */}
            {imagenActual && !imagenNueva && (
              <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                <img src={imagenActual} alt="Actual" style={{ height: '100px', borderRadius: '8px' }} />
                <p style={{ fontSize: '0.8rem', color: '#666' }}>Imagen actual</p>
              </div>
            )}

            <input 
              type="file" 
              accept="image/*"
              className="form-input"
              onChange={e => setImagenNueva(e.target.files[0])} 
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button type="button" onClick={() => navigate('/productos')} className="btn" style={{ background: '#ccc', color: '#333' }}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              GUARDAR CAMBIOS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarProductoPage;