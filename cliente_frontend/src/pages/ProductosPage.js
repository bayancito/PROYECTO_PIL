import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import './ProductosPage.css'; // Importamos el CSS nuevo

const API_URL = '/productos/';

function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(API_URL)
      .then(response => {
        setProductos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al obtener productos!", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="page-container"><h2>Cargando catálogo...</h2></div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Nuestros Productos</h1>

      {productos.length === 0 ? (
        <div className="content-card" style={{ textAlign: 'center' }}>
          <p>No hay productos disponibles.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {productos.map(producto => (
            <div key={producto.id} className="product-card">
              
              {/* IMAGEN DEL PRODUCTO */}
              <div className="product-image-container">
                {producto.imagen ? (
                  <img 
                    src={producto.imagen} 
                    alt={producto.nombre} 
                    className="product-image" 
                  />
                ) : (
                  // Si no hay imagen, mostramos la inicial
                  <div className="no-image-placeholder">
                    {producto.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* DETALLES */}
              <div className="product-details">
                <span className="product-category">
                  {producto.categoria ? `Categoría ${producto.categoria}` : 'PIL Andina'}
                </span>
                
                <h3 className="product-title">{producto.nombre}</h3>
                
                <p className="product-description">
                  {producto.descripcion || "Producto de alta calidad garantizada por PIL Andina."}
                </p>

                <div className="product-footer">
                  <span className="product-price">${producto.precio}</span>
                  {/* Botón decorativo de "Añadir" */}
                  <button className="product-btn" title="Añadir a pedido">
                    +
                  </button>
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