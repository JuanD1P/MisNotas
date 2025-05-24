import React from 'react';
import { useNavigate } from 'react-router-dom';


function Inicio() {
  const navigate = useNavigate(); 

  return (
    <>
      <div>
        <h1>Inicio</h1>
        <button onClick={() => navigate('/clima')} className="boton-clima">
          🌤️ Consultar Clima
        </button>
      </div>
      <div>
        <button onClick={() => navigate('/ChatIA')} className="boton-clima">
          🤖 ChatIA
        </button>
      </div>
    </>
  );
}

export default Inicio;
