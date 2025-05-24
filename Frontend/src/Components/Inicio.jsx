import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DOCSS/Inicio.css';

function Inicio() {
  const navigate = useNavigate(); 
  const [materias, setMaterias] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [filtro, setFiltro] = useState('proximas');

  const userId = localStorage.getItem('user-id');

  useEffect(() => {
    axios.get(`http://localhost:3000/api/materias?usuario_id=${userId}`)
      .then(res => setMaterias(res.data))
      .catch(err => console.error("Error al obtener materias:", err));

    obtenerRecordatorios();
  }, [userId]);

  const obtenerRecordatorios = () => {
    axios.get(`http://localhost:3000/api/recordatorios?usuario_id=${userId}`)
      .then(res => setRecordatorios(res.data))
      .catch(err => console.error("Error al obtener recordatorios:", err));
  };

  const tareasEnFecha = (date) => {
    const fechaLocal = date.toLocaleDateString('sv-SE');
    return recordatorios.filter(r => new Date(r.fecha_entrega).toLocaleDateString('sv-SE') === fechaLocal);
  };

  const tareasFiltradas = () => {
    const hoy = new Date();
    const sieteDias = new Date();
    sieteDias.setDate(hoy.getDate() + 7);

    if (filtro === 'proximas') {
      return recordatorios
        .filter(r => {
          const fecha = new Date(r.fecha_entrega);
          return fecha >= hoy && fecha <= sieteDias;
        })
        .sort((a, b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega));
    } else if (filtro === 'entregadas') {
      return recordatorios.filter(r => r.enviado === 1);
    } else {
      return recordatorios.sort((a, b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega));
    }
  };

  const marcarComoEntregado = async (id) => {
    try {
      await axios.put(`http://localhost:3000/api/recordatorios/${id}/entregar`);
      obtenerRecordatorios();
    } catch (err) {
      console.error("Error al actualizar el estado:", err);
    }
  };

  const eliminarRecordatorio = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este recordatorio?")) {
      try {
        await axios.delete(`http://localhost:3000/api/recordatorios/${id}`);
        obtenerRecordatorios();
      } catch (err) {
        console.error("Error al eliminar recordatorio:", err);
      }
    }
  };

  return (
    <div className="inicio-container">
      <header className="inicio-header">
        <h1 className="titulo-animado">📚 Mis Recordatorios Académicos</h1>
        <button onClick={() => navigate("/AgregarPendiente")} className="boton-agregar">
          ➕ Nuevo Recordatorio
        </button>
      </header>

      <section className="recordatorios-hoy">
        <div className="filtro-botones">
          <button onClick={() => setFiltro('proximas')} className={filtro === 'proximas' ? 'activo' : ''}>
            Próximas 7 días
          </button>
          <button onClick={() => setFiltro('todas')} className={filtro === 'todas' ? 'activo' : ''}>
            Todas las tareas
          </button>
          <button onClick={() => setFiltro('entregadas')} className={filtro === 'entregadas' ? 'activo' : ''}>
            Entregadas
          </button>
        </div>

        <h2 className="titulo-animado">
          {filtro === 'proximas' ? '📌 Tareas próximas (7 días)' : filtro === 'entregadas' ? '✅ Entregadas' : '🗂️ Todas las tareas'}
        </h2>

        {tareasFiltradas().length === 0 ? (
          <p className="mensaje-vacio">No tienes tareas en este filtro.</p>
        ) : (
          <ul className="lista-animada">
            {tareasFiltradas().map(r => (
              <li key={r.id} className={`tarea-card ${r.enviado ? 'enviada' : ''}`}>
                <h3>📝 {r.titulo}</h3>
                <p>{r.descripcion}</p>
                <span className="fecha">📅 {new Date(r.fecha_entrega).toLocaleDateString()}</span>
                <div className="acciones">
                  {r.enviado ? (
                    <span className="badge-enviado">📧 Notificado</span>
                  ) : (
                    <button onClick={() => marcarComoEntregado(r.id)} className="marcar-entregado animado-boton">
                      ✅ Entregado
                    </button>
                  )}
                  <button onClick={() => eliminarRecordatorio(r.id)} className="eliminar animado-boton">
                    🗑 Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel-inferior nuevo-layout">
        <div className="materias-section tarjetas-materias">
          <h2 className="titulo-animado">📘 Mis Materias</h2>
          <div className="tarjetas-container">
            {materias.map((m, i) => (
              <div className={`tarjeta-materia color-${i % 5}`} key={m.id}>
                <span className="icono-materia">📘</span>
                <p>{m.nombre}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="calendario-full nuevo-estilo-calendario">
          <h2>📅 Agenda del Mes</h2>
          <Calendar
            value={fechaSeleccionada}
            onChange={setFechaSeleccionada}
            tileContent={({ date }) => {
              const tareas = tareasEnFecha(date);
              return tareas.length > 0 ? (
                <div className="marcador-fecha"></div>
              ) : null;
            }}
          />

          <div className="detalle-tareas">
            <h3>📌 {fechaSeleccionada.toLocaleDateString()}</h3>
            <ul>
              {tareasEnFecha(fechaSeleccionada).length > 0 ? (
                tareasEnFecha(fechaSeleccionada).map(t => (
                  <li key={t.id}>📝 <strong>{t.titulo}</strong> — {t.descripcion}</li>
                ))
              ) : (
                <li>No hay tareas para este día.</li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Inicio;
