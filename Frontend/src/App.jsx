import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './Components/Login'; 
import Registro from './Components/Registro';
import Inicio from './Components/Inicio';
import Create from './Components/Create';
import NotFound from "./Components/NotFound";
import AgregarPendiente from './Components/AgregarPendiente';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProtectedRoute from './Components/PrivateRoute';
import Materias from './Components/Materias';

function App() {
    return (
        <Router>
            <>
                {/* Contenedor de notificaciones */}
                <ToastContainer 
                    position="top-right" 
                    autoClose={3000} 
                    hideProgressBar={false}
                    newestOnTop={true}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />

                <Routes>
                    <Route path="/" element={<Navigate to="/userlogin" />} />
                    <Route path="/userlogin" element={<Login />} />
                    <Route path="/Registro" element={<Registro />} />
                    
                    
                    {/* RUTAS PARA EL ADMINISTRADOR */}
                    <Route path="/Create" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <Create />
                        </ProtectedRoute>
                    } />

                    {/* RUTAS PARA LOS USUARIOS */}   
                    <Route path="/Inicio" element={
                        <ProtectedRoute allowedRoles={['USER']}>
                            <Inicio />
                        </ProtectedRoute>
                    } />
                    <Route path="/AgregarPendiente" element={
                        <ProtectedRoute allowedRoles={['USER']}>
                            <AgregarPendiente />
                        </ProtectedRoute>
                    } />
                    {/* RUTAS PARA materias */}
                    <Route path="/materias" element={
                        <ProtectedRoute allowedRoles={['USER']}>
                            <Materias />
                        </ProtectedRoute>
                    } />

                 

                
                    {/* RUTA NO ENCONTRADA */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </>
        </Router>
    );
}

export default App;
