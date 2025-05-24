import React from 'react';
import { useNavigate } from 'react-router-dom';


function Inicio() {
  const navigate = useNavigate(); 

  return (
    <>
      <div>
        <h1>Inicio</h1>
        <button onClick={() => navigate("/AgregarPendiente")}>
          Agregar Recordatorio
        </button>

      </div>
    </>
  );
}

export default Inicio;
