import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-white text-[#0f172a] px-6 py-12 text-center">

      <div className="absolute inset-0 bg-[radial-gradient(circle,_#e2e8f0_1px,_transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none z-0" />

      <h1 className="text-[8rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-lg z-10 animate-glitch">
        404
      </h1>

      <p className="text-2xl font-semibold mt-2 z-10 tracking-wide">
        ¡Ups! Esta página no existe
      </p>

      <p className="text-base text-gray-600 mt-2 max-w-md z-10">
        Tal vez la movieron, renombraron… o simplemente nunca existió.
      </p>

      <img
        src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"
        alt="404 Caveman"
        className="w-[320px] mt-10 rounded-xl border border-slate-200 shadow-lg animate-float z-10"
      />

 

      {/* Animaciones personalizadas */}
      <style>{`
        @keyframes glitch {
          0% { text-shadow: 2px 2px #ff00c8, -2px -2px #00ffe0; }
          20% { text-shadow: -2px 2px #00ffae, 2px -2px #ff006f; }
          40% { text-shadow: 2px -2px #00c8ff, -2px 2px #ffd700; }
          60% { text-shadow: -1px 1px #ff00c8, 1px -1px #00ffe0; }
          80% { text-shadow: 1px 1px #00ffae, -1px -1px #ff006f; }
          100% { text-shadow: 2px 2px #ff00c8, -2px -2px #00ffe0; }
        }
        .animate-glitch {
          animation: glitch 1.8s infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;