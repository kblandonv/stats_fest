// src/components/stats.js
import React, { useEffect, useState } from 'react';
import TopArtists from './TopArtists';
import TopTracks from './TopTracks';
import TopGenres from './TopGenres';
import { useNavigate } from 'react-router-dom';

const Stats = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:4000/check-auth', {
                    credentials: 'include'  // Para enviar cookies
                });
                if (!response.ok) {
                    throw new Error('No autenticado');
                }
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error de autenticación:', error);
                navigate('/');
            }
        };

        checkAuth();
    }, [navigate]);

    if (!isAuthenticated) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Tus Estadísticas de Spotify</h1>
            <TopArtists />
            <TopTracks />
            <TopGenres />
        </div>
    );
};

export default Stats;