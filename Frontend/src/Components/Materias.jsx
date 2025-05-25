import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DOCSS/Materias.css';

const API_URL = 'http://localhost:3000/api';

const Materias = () => {
  const [materias, setMaterias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [usuarioId] = useState(localStorage.getItem('user-id'));
  const [notas, setNotas] = useState({});
  const [nota, setNota] = useState({ titulo: '', valor: '', porcentaje: '' });
  const [notaEditando, setNotaEditando] = useState(null);

  const navigate = useNavigate();

  const fetchMaterias = async () => {
    try {
      const res = await axios.get(`${API_URL}/materias?usuario_id=${usuarioId}`);
      const materiasData = Array.isArray(res.data) ? res.data : res.data.materias;
      setMaterias(materiasData || []);
    } catch (error) {
      console.error('Error al obtener materias:', error);
    }
  };

  useEffect(() => {
    if (usuarioId) {
      fetchMaterias();
    }
  }, [usuarioId]);

  const agregarMateria = async () => {
    try {
      await axios.post(`${API_URL}/materias`, { usuario_id: usuarioId, nombre, descripcion });
      setNombre('');
      setDescripcion('');
      fetchMaterias();
    } catch (error) {
      console.error('Error al agregar materia:', error);
    }
  };

  const eliminarMateria = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta materia?')) return;
    try {
      await axios.delete(`${API_URL}/materias/${id}`);
      fetchMaterias();
    } catch (error) {
      console.error('Error al eliminar materia:', error);
    }
  };

  const fetchNotas = async (materiaId) => {
    try {
      const res = await axios.get(`${API_URL}/notas?materia_id=${materiaId}`);
      setNotas((prev) => ({ ...prev, [materiaId]: res.data }));
    } catch (error) {
      console.error('Error al obtener notas:', error);
    }
  };

  const eliminarNota = async (notaId, materiaId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta nota?')) return;
    try {
      await axios.delete(`${API_URL}/notas/${notaId}`);
      fetchNotas(materiaId);
    } catch (error) {
      console.error('Error al eliminar nota:', error);
    }
  };

  const editarNota = async (notaEditada, materiaId) => {
    try {
      await axios.put(`${API_URL}/notas/${notaEditada.id}`, notaEditada);
      fetchNotas(materiaId);
    } catch (error) {
      console.error('Error al editar nota:', error);
    }
  };

  const agregarNota = async (materiaId) => {
    const suma = (notas[materiaId] || []).reduce((acc, n) => acc + parseFloat(n.porcentaje || 0), 0);
    const nuevoTotal = suma + parseFloat(nota.porcentaje || 0);

    if (nuevoTotal > 100) {
      alert(`La suma de porcentajes no puede exceder 100% (actual: ${suma}%)`);
      return;
    }

    try {
      await axios.post(`${API_URL}/notas`, { ...nota, materia_id: materiaId });
      setNota({ titulo: '', valor: '', porcentaje: '' });
      fetchNotas(materiaId);
    } catch (error) {
      console.error('Error al agregar nota:', error);
    }
  };

  return (
    <div className="inicio-container">
      <div className="inicio-header">
        <h2 className="titulo-animado">Mis Materias</h2>
        <div className="filtro-botones"></div>
      </div>

      <div className="formulario-materia">
        <input
          type="text"
          placeholder="Nombre de la materia"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <div className="botones-materias">
          <button onClick={agregarMateria} className="boton-agregar">
            Agregar Materia ➕
          </button>
          <button onClick={() => navigate("/Inicio")} className="boton-agregar">
            Inicio
          </button>
        </div>
      </div>

      <div className="tarjetas-container">
        {Array.isArray(materias) && materias.map((mat, idx) => (
          <div key={mat.id} className={`materia-card color-${idx % 5}`}>
            <span className="icono-materia">📚</span>
            <h3>{mat.nombre}</h3>
            <p>{mat.descripcion}</p>
            <div className="acciones">
              <button className="animado-boton eliminar" onClick={() => eliminarMateria(mat.id)}>
                Eliminar
              </button>
              <button className="animado-boton marcar-entregado" onClick={() => fetchNotas(mat.id)}>
                Ver Notas
              </button>
            </div>

            <div className="detalle-tareas">
              {Array.isArray(notas[mat.id]) && notas[mat.id].length > 0 ? (
                notas[mat.id].map((n, i) => (
                  <li key={i}>
                    📝 <strong>{n.titulo}</strong> - {n.valor} ({n.porcentaje}%)
                    <button
                      className="boton-mini editar"
                      onClick={() => setNotaEditando({ ...n, materia_id: mat.id })}
                    >
                      ✏️
                    </button>
                    <button
                      className="boton-mini eliminar"
                      onClick={() => eliminarNota(n.id, mat.id)}
                    >
                      🗑️
                    </button>
                  </li>
                ))
              ) : (
                <p style={{ fontStyle: 'italic', color: '#666' }}>No hay notas aún.</p>
              )}
            </div>

            <div className="formulario-nota">
              <input
                type="text"
                placeholder="Título"
                value={nota.titulo}
                onChange={(e) => setNota({ ...nota, titulo: e.target.value })}
              />
              <input
                type="number"
                placeholder="Nota"
                value={nota.valor}
                onChange={(e) => setNota({ ...nota, valor: e.target.value })}
              />
              <input
                type="number"
                placeholder="%"
                value={nota.porcentaje}
                onChange={(e) => setNota({ ...nota, porcentaje: e.target.value })}
              />
              <button className="boton-agregar" onClick={() => agregarNota(mat.id)}>
                Agregar Nota
              </button>

              {notaEditando && notaEditando.materia_id === mat.id && (
                <div className="formulario-edicion">
                  <input
                    type="text"
                    placeholder="Título"
                    value={notaEditando.titulo}
                    onChange={(e) => setNotaEditando({ ...notaEditando, titulo: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Nota"
                    value={notaEditando.valor}
                    onChange={(e) => setNotaEditando({ ...notaEditando, valor: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="%"
                    value={notaEditando.porcentaje}
                    onChange={(e) => setNotaEditando({ ...notaEditando, porcentaje: e.target.value })}
                  />
                  <button
                    className="boton-agregar"
                    onClick={() => {
                      editarNota(notaEditando, mat.id);
                      setNotaEditando(null);
                    }}
                  >
                    Guardar Cambios
                  </button>
                  <button className="boton-cancelar" onClick={() => setNotaEditando(null)}>
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Materias;
