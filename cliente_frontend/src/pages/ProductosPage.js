import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { Link } from 'react-router-dom';
import './ProductosPage.css'; // CSS Actualizado
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const API_URL = '/productos/';

function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const rol = localStorage.getItem('rol');

  const fetchProductos = () => {
    apiClient.get(API_URL)
      .then(response => {
        setProductos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto permanentemente?")) {
      apiClient.delete(`${API_URL}${id}/`)
        .then(() => fetchProductos())
        .catch(() => alert("Error al eliminar"));
    }
  };

  if (loading) return <div className="page-container"><h2>Cargando catálogo...</h2></div>;

  return (
    <div className="page-container">
      
      {/* CABECERA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 className="page-title" style={{ textAlign: 'left', margin: 0 }}>Inventario de Productos</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Gestiona el catálogo visible para los pedidos.</p>
        </div>
        
        {rol === 'admin' && (
          <Link to="/productos/nuevo" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaPlus /> Nuevo Producto
          </Link>
        )}
      </div>

      {/* GRID DE PRODUCTOS */}
      {productos.length === 0 ? (
        <div className="content-card" style={{ textAlign: 'center', padding: '50px' }}>
          <p>No hay productos registrados en el sistema.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {productos.map(producto => (
            <div key={producto.id} className="product-card">
              
              {/* IMAGEN */}
              <div className="product-image-container">
                {producto.imagen ? (
                  <img src={producto.imagen} alt={producto.nombre} className="product-image" />
                ) : (
                  <div className="no-image-placeholder">{producto.nombre.charAt(0).toUpperCase()}</div>
                )}
              </div>

              {/* INFO */}
              <div className="product-details">
                <span className="product-category">
                  {producto.categoria ? producto.categoria : 'PIL Andina'}
                </span>
                
                <h3 className="product-title" title={producto.nombre}>
                  {producto.nombre}
                </h3>
                
                <p className="product-description">
                  {producto.descripcion || "Sin descripción detallada."}
                </p>

                <div className="product-footer">
                  <div className="product-price">Bs. {producto.precio}</div>
                  
                  {/* BOTONES DE GESTIÓN (Solo Admin) */}
                  {rol === 'admin' && (
                    <div className="admin-actions-row">
                      <Link to={`/productos/editar/${producto.id}`} className="btn-action btn-edit">
                        <FaEdit /> Editar
                      </Link>
                      <button onClick={() => handleDelete(producto.id)} className="btn-action btn-delete">
                        <FaTrash /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductosPage;