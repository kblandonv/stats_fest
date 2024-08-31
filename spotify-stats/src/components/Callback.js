// src/components/Callback.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            fetch('http://localhost:4000/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.cookie = `access_token=${data.access_token}; path=/;`;
                        navigate('/stats');
                    } else {
                        console.error('Error during authentication:', data.error);
                        navigate('/');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    navigate('/');
                });
        } else {
            navigate('/');
        }
    }, [navigate]);

    return <div>Procesando autenticación...</div>;
};

export default Callback;
