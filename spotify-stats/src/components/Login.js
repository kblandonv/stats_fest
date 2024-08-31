// src/components/Login.js
import React from 'react';
import styled from 'styled-components';

const LoginButton = styled.a`
    display: inline-block;
    padding: 12px 24px;
    background-color: #1DB954;
    color: white;
    border-radius: 50px;
    text-decoration: none;
    font-weight: bold;
    margin: 20px auto;
    text-align: center;
    transition: background-color 0.3s;
    margin-left: auto;
    margin-right: auto;

    &:hover {
        background-color: #1ed760;
    }
`;

const Login = () => {
    const handleLogin = () => {
        window.location.href = 'http://localhost:4000/login';  // Redirige a la ruta de inicio de sesión en el backend
    };

    return (
        <div>
            <h1 style={{ textAlign: 'center' }}>Inicia Sesión con Spotify</h1>
            <LoginButton onClick={handleLogin}>
                Iniciar Sesión
            </LoginButton>
        </div>
    );
};

export default Login;
