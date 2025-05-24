import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Coney from '../ImagenesP/GranjeroPOP.png'; 
import logo from '../ImagenesP/ImagenesLogin/logoMiAgro.png';
import './DOCSS/Login.css';

const Login = () => {
    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    useEffect(() => {
        localStorage.clear(); // Borra todo al entrar a /login
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        setError(null);
    
        if (!values.email || !values.password) {
            setError('Todos los campos deben ser completados');
            return;
        }
    
        axios.post('http://localhost:3000/auth/userlogin', values)
        .then(result => {
            if (result.data.loginStatus) {
                localStorage.setItem('auth-token', result.data.token);
                localStorage.setItem('user-role', result.data.role);  // Guarda el rol
    
                if (result.data.role === 'USER') {
                    navigate('/Inicio');
                } else if (result.data.role === 'ADMIN') {
                    navigate('/Create');
                }
            } else {
                setError(result.data.Error);
            }
        })
        .catch(err => console.log(err));
    
    };
    
    return (
        <div className="LoginPcontainer">
            <img src={logo} alt="Logo" className="logoLogin" />
            <div className='LoginScontainer'>
                <div className={`text-dangerLogin ${error ? 'show' : ''}`}>
                    {error && error}
                </div>
                <h2>Inicio de Sesión</h2>
                <form onSubmit={handleSubmit} className='formularioLogin'>
                    <div className='form1'>
                        <label htmlFor='email'><strong>Email</strong></label>
                        <input 
                            type='email' 
                            name='email' 
                            autoComplete='off' 
                            placeholder='Ingresa Email' 
                            onChange={(e) => setValues({ ...values, email: e.target.value })}
                            style={{ width: '300px', padding: '10px', fontSize: '16px' }}
                            className='input1'

                        />
                    </div>
                    <div className='form2'>
                        <label htmlFor='password'><strong>Contraseña</strong></label>
                        <input 
                            type='password' 
                            name='password' 
                            placeholder='Ingresa Contraseña' 
                            onChange={(e) => setValues({ ...values, password: e.target.value })}
                            className='input2'
                        />
                    </div>
                    
                    <button type="submit" className='boton2'>Ingresa</button>
                </form>
                <button onClick={() => navigate('/Registro')} className='botonLogin1'>Ir a Registro</button>
            </div>
            <img src={Coney} alt="Coney" className='ConeyLogin' />
        </div>
    );
};

export default Login;