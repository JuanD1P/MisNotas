import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./DOCSS/Create.css";

function Create() {
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState('');

  const fetchUsuarios = () => {
    axios.get('http://localhost:3000/api/usuarios')
      .then(response => {
        setUsuarios(response.data);
      })
      .catch(error => {
        console.error("Error al obtener usuarios:", error);
        setUsuarios([]);
      });
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const cambiarRol = async (id, nuevoRol) => {
    try {
      await axios.put(`http://localhost:3000/api/usuarios/${id}/rol`, { rol: nuevoRol });
      setMensaje(`Rol actualizado para el usuario con ID ${id}`);
      fetchUsuarios();
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      setMensaje('Error al cambiar el rol');
    }
  };

  const eliminarUsuario = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await axios.delete(`http://localhost:3000/api/usuarios/${id}`);
        setMensaje(`Usuario con ID ${id} eliminado.`);
        fetchUsuarios();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        setMensaje('Error al eliminar el usuario');
      }
    }
  };

  return (
    <div className="admin-panel">
      <h2 className="chat-title">Panel de Administración de Usuarios</h2>
      {mensaje && <p className="mensaje">{mensaje}</p>}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.nombre_completo}</td>
                <td>{usuario.email}</td>
                <td>
                  <select
                    value={usuario.rol}
                    onChange={(e) => cambiarRol(usuario.id, e.target.value)}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td>
                  <button
                    className="boton-eliminar"
                    onClick={() => eliminarUsuario(usuario.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Create;
