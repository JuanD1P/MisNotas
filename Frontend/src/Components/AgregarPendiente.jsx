import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './DOCSS/Formulario.css';

function AgregarPendiente() {
  const [materias, setMaterias] = useState([]);
  const [form, setForm] = useState({
    materia_id: '',
    titulo: '',
    descripcion: '',
    fecha_entrega: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('user-id');
    axios.get(`http://localhost:3000/api/materias?usuario_id=${userId}`)
      .then(res => setMaterias(res.data))
      .catch(err => console.error("Error al obtener materias:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('user-id');
    try {
      await axios.post('http://localhost:3000/api/recordatorios', {
        usuario_id: userId,
        materia_id: form.materia_id,
        titulo: form.titulo,
        descripcion: form.descripcion,
        fecha_entrega: form.fecha_entrega
      });
      alert('Recordatorio agregado exitosamente');
      navigate('/Inicio');
    } catch (err) {
      console.error("Error al agregar recordatorio:", err);
      alert('Hubo un error al guardar el recordatorio.');
    }
  };

  return (
    <div className="form-container">
      <h2>Agregar Recordatorio Académico</h2>
      <form onSubmit={handleSubmit}>
        <label>Materia:</label>
        <select name="materia_id" value={form.materia_id} onChange={handleChange} required>
          <option value="">Seleccione una materia</option>
          {materias.map(m => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>

        <label>Título:</label>
        <input type="text" name="titulo" value={form.titulo} onChange={handleChange} required />

        <label>Descripción:</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange}></textarea>

        <label>Fecha de entrega:</label>
        <input type="date" name="fecha_entrega" value={form.fecha_entrega} onChange={handleChange} required />

        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}

export default AgregarPendiente;
