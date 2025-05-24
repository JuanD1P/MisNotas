import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import './DOCSS/Registro.css';
import { toast } from 'react-toastify';


const Registro = () => {
    const [values, setValues] = useState({
        nombre_completo: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [termsAccepted, setTermsAccepted] = useState(false);

    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        if (!values.nombre_completo || !values.email || !values.password || !values.confirmPassword) {
            setError("Todos los campos son obligatorios");
            return;
        }

        if (values.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (values.password !== values.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        const dataToSend = {
            nombre_completo: values.nombre_completo,
            email: values.email,
            password: values.password
        };

        try {
            const result = await axios.post('http://localhost:3000/auth/register', dataToSend);
            if (result.data.registrationStatus) {
                toast.success("✅ Registro exitoso");
                navigate('/userlogin');
            } else {
                setError(result.data.Error);
                toast.error(result.data.Error || "❌ Error en el registro");
            }
        } catch (err) {
            console.error("Error en el registro:", err);
            setError("Error en el servidor, intenta más tarde");
            toast.error("❌ Error en el servidor, intenta más tarde");
        }

    };

    return (
        <div className="RegistroPcontainer">
        
            <div className='RegistroScontainer'>
            <h2>REGISTRO</h2>

            {error && <div className='text-dangerRegistro'>{error}</div>}

            <form onSubmit={handleSubmit} className='formularioRegistro'>
                <div className='form1'>
                <label><strong>Nombre Completo</strong></label>
                <input 
                    type="text"
                    placeholder='Ingresa tu nombre completo'
                    value={values.nombre_completo}
                    onChange={(e) => setValues({ ...values, nombre_completo: e.target.value })} 
                    required
                    style={{ width: '300px', padding: '10px', fontSize: '16px' }}
                />
                </div>

                <div className='form2'>
                <label><strong>Email</strong></label>
                <input 
                    type="email"
                    placeholder='Ingresa tu email'
                    value={values.email}
                    onChange={(e) => setValues({ ...values, email: e.target.value })} 
                    required
                />
                </div>

                <div className='form2'>
                <label><strong>Contraseña</strong></label>
                    <div className="VerContraseña">
                    <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={values.password}
                        placeholder='Ingresa tu contraseña'
                        onChange={(e) => setValues({ ...values, password: e.target.value })} 
                        required
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    </div>
                </div>

                <div className='form2'>
                <label><strong>Confirmar Contraseña</strong></label>
                <div className="VerContraseña">
                    <input 
                        placeholder='Confirma tu contraseña'
                        type={showConfirmPassword ? 'text' : 'password'} 
                        value={values.confirmPassword}
                        onChange={(e) => setValues({ ...values, confirmPassword: e.target.value })} 
                        required
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                </div>

                <button type="submit" className='botonRegistro'>Registrarse</button>

            </form>
            <button onClick={() => navigate('/userlogin')} className='botonLogin1'>Iniciar Sesion</button>
            </div>
        </div>
    );
};

export default Registro;