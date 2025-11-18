import React, { useState, useEffect } from 'react';
import apiClient from '../api'; // <-- ¡Correcto!

// URL de la API específica para esta página
// --- CAMBIO AQUÍ ---
// Tenía comillas dobles y simples (''/productos/';'). 
// Ahora está corregido:
const API_URL = '/productos/';

function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Esta llamada ahora usará apiClient y enviará el token
    apiClient.get(API_URL) // <-- ¡Correcto!
      .then(response => {
        setProductos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al obtener productos!", error);
        // Si el token es inválido, el error 401/403 se mostrará aquí
        setLoading(false);
      });
  }, []);

  if (loading) return <h1>Cargando catálogo...</h1>;

  // El return (JSX) está perfecto, no necesita cambios
  return (
    <div>
      {/* --- Lista de Productos --- */}
      <h1>Catálogo de Productos</h1>
      <ul>
        {productos.map(producto => (
          <li key={producto.id}>
            <strong>{producto.nombre}</strong> - Precio: ${producto.precio}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductosPage;