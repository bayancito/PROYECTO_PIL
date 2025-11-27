import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { Link } from 'react-router-dom';
// Importamos los iconos necesarios (Teléfono, Camión, etc.)
import { FaUserTie, FaIdCard, FaTrash, FaEdit, FaPlus, FaPhone, FaTruck, FaUserLock } from 'react-icons/fa';

function ConductoresPage() {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del formulario (Datos del Conductor)
  const [nombre, setNombre] = useState('');
  const [licencia, setLicencia] = useState('');
  const [telefono, setTelefono] = useState(''); // NUEVO
  const [placa, setPlaca] = useState('');       // NUEVO
  
  // Estados para el Usuario (Login)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [showForm, setShowForm] = useState(false);

  const fetchConductores = () => {
    apiClient.get('/conductores/')
      .then(response => {
        setConductores(response.data);
        setLoading(false);
      })
      .catch(error => console.error(error));
  };

  useEffect(() => { fetchConductores(); }, []);

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar este conductor y su acceso?")) {
      apiClient.delete(`/conductores/${id}/`)
        .then(() => fetchConductores())
        .catch(err => alert("Error al eliminar"));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Objeto con todos los datos
    const nuevoConductor = {
      nombre,
      licencia,
      telefono,       // Enviamos teléfono
      placa_vehiculo: placa, // Enviamos placa (ojo con el nombre del campo en BD)
      username, 
      password,
      estado: 'disponible'
    };

   // En ConductoresPage.js dentro de handleSubmit

    apiClient.post('/conductores/', nuevoConductor)
      .then(res => {
        alert("¡Conductor y Usuario creados con éxito!");
        setConductores([...conductores, res.data]);
        // Limpiar formulario
        setNombre(''); setLicencia(''); setTelefono(''); setPlaca('');
        setUsername(''); setPassword('');
        setShowForm(false);
      })
      .catch(err => {
        console.error(err);
        // --- CÓDIGO MEJORADO PARA VER EL ERROR REAL ---
        if (err.response && err.response.data) {
            // Esto te mostrará: {"username": ["A user with that username already exists."]}
            // o {"licencia": ["Conductor with this Licencia already exists."]}
            alert(`Error: ${JSON.stringify(err.response.data)}`);
        } else {
            alert("Error desconocido al crear.");
        }
      });
  };

  // Estilo para tarjeta
  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    border: '1px solid #f0f0f0',
    transition: 'transform 0.2s'
  };

  if (loading) return <div className="page-container"><h2>Cargando equipo...</h2></div>;

  return (
    <div className="page-container">
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Equipo de Transportistas</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <FaPlus /> {showForm ? 'Cancelar' : 'Nuevo Conductor'}
        </button>
      </div>

      {/* --- FORMULARIO DE CREACIÓN --- */}
      {showForm && (
        <div className="content-card" style={{ marginBottom: '40px', borderLeft: '5px solid #003DA5' }}>
          <h2 className="section-title">Registrar Nuevo Conductor</h2>
          <form onSubmit={handleSubmit}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '20px' }}>
              
              {/* COLUMNA 1: DATOS PERSONALES Y VEHÍCULO */}
              <div>
                <h4 style={{color: '#666', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom:'5px'}}>Información General</h4>
                
                <div className="form-group">
                    <label className="form-label">Nombre Completo</label>
                    <input className="form-input" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Ej. Juan Perez" />
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                    <div className="form-group">
                        <label className="form-label">N° Licencia</label>
                        <input className="form-input" value={licencia} onChange={e => setLicencia(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Celular</label>
                        <input className="form-input" type="number" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="777XXXXX" />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Placa del Vehículo Asignado</label>
                    <input className="form-input" value={placa} onChange={e => setPlaca(e.target.value)} placeholder="Ej. 2345-XYZ" />
                </div>
              </div>

              {/* COLUMNA 2: ACCESO AL SISTEMA */}
              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', height: 'fit-content' }}>
                <h4 style={{color: '#003DA5', marginBottom: '15px', display:'flex', alignItems:'center', gap:'10px'}}>
                    <FaUserLock /> Credenciales de Acceso
                </h4>
                <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '15px'}}>
                    Crea el usuario y contraseña para que el conductor ingrese a la App.
                </p>

                <div className="form-group">
                    <label className="form-label">Usuario (Login)</label>
                    <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} required placeholder="ej: jperez" />
                </div>
                <div className="form-group">
                    <label className="form-label">Contraseña</label>
                    <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <button type="submit" className="btn btn-success" style={{ padding: '12px 50px' }}>GUARDAR REGISTRO</button>
            </div>
          </form>
        </div>
      )}

      {/* --- LISTA DE TARJETAS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
        {conductores.map(conductor => (
          <div key={conductor.id} style={cardStyle}>
            
            <div style={{ display: 'flex', alignItems: 'start', gap: '15px', marginBottom: '15px' }}>
              {/* Avatar Circular */}
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%', background: '#eef2ff', color: '#003DA5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0
              }}>
                <FaUserTie />
              </div>
              
              <div style={{ width: '100%' }}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '1.1rem' }}>{conductor.nombre}</h3>
                    {/* Badge Estado */}
                    <span style={{ 
                    padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase',
                    background: conductor.estado === 'disponible' ? '#d1fae5' : '#fee2e2',
                    color: conductor.estado === 'disponible' ? '#065f46' : '#991b1b',
                    height: 'fit-content'
                    }}>
                    {conductor.estado}
                    </span>
                </div>
                <div style={{fontSize:'0.85rem', color:'#666'}}>{conductor.username}</div>
              </div>
            </div>

            {/* Datos en Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', color: '#555', background: '#fbfbfb', padding: '10px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaIdCard style={{color:'#999'}}/> {conductor.licencia}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaPhone style={{color:'#999'}}/> {conductor.telefono || '--'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: 'span 2' }}>
                    <FaTruck style={{color:'#003DA5'}}/> 
                    <span style={{fontWeight: 'bold'}}>Placa: {conductor.placa_vehiculo || 'Sin vehículo'}</span>
                </div>
            </div>

            {/* Botones Acción */}
            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '10px' }}>
              <Link to={`/conductores/editar/${conductor.id}`} style={{ flex: 1 }}>
                <button className="btn" style={{ width: '100%', background: '#f3f4f6', color: '#333', borderRadius: '8px', padding: '8px', fontSize: '0.9rem' }}>
                  <FaEdit /> Editar
                </button>
              </Link>
              <button 
                onClick={() => handleDelete(conductor.id)}
                className="btn" 
                style={{ flex: 1, background: '#fff1f2', color: '#e11d48', borderRadius: '8px', padding: '8px', fontSize: '0.9rem' }}
              >
                <FaTrash /> Borrar
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default ConductoresPage;