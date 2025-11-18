// En: src/api.js

import axios from 'axios';

// 1. Creamos una "instancia" de axios
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/core/api' // La URL base de tu API
});

// 2. Creamos el "Interceptor"
// Esto se ejecuta en CADA petición que hagamos
apiClient.interceptors.request.use(
  config => {
    // 3. Obtenemos el token de localStorage
    const token = localStorage.getItem('token');
    
    // 4. Si el token existe, lo añadimos a las cabeceras
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    
    return config; // Devolvemos la config con el token
  },
  error => {
    return Promise.reject(error);
  }
);

export default apiClient;