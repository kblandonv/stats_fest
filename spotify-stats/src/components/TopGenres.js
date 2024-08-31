import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Section = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h2`
  color: #1DB954;
  border-bottom: 2px solid #1DB954;
  padding-bottom: 10px;
`;

const GenresContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const GenreBadge = styled.span`
  background-color: #1DB954;
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.9em;
`;

const TopGenres = () => {
    const [genres, setGenres] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopGenres = async () => {
            try {
                const response = await axios.get('http://localhost:4000/top-genres', { withCredentials: true });
                setGenres(response.data.genres);
            } catch (err) {
                console.error('Error fetching top genres:', err);
                if (err.response && err.response.status === 401) {
                    // Token expirado, intentar refrescar
                    try {
                        await axios.get('http://localhost:4000/refresh-token', { withCredentials: true });
                        // Reintentar la solicitud original
                        const retryResponse = await axios.get('http://localhost:4000/top-genres', { withCredentials: true });
                        setGenres(retryResponse.data.genres);
                    } catch (refreshError) {
                        console.error('Error refreshing token:', refreshError);
                        setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
                        navigate('/');
                    }
                } else {
                    setError('No se pudieron cargar los géneros.');
                }
            }
        };

        fetchTopGenres();
    }, [navigate]);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <Section>
            <Title>Top Géneros</Title>
            <GenresContainer>
                {genres.map((genre, index) => (
                    <GenreBadge key={index}>{genre}</GenreBadge>
                ))}
            </GenresContainer>
        </Section>
    );
};

export default TopGenres;