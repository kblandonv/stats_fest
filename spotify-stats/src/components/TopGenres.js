import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

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

const TopGenres = ({ timeRange }) => {
    const [genres, setGenres] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axios.get(`/top-genres?time_range=${timeRange}`);
                if (response.data && Array.isArray(response.data.genres)) {
                    setGenres(response.data.genres);
                } else {
                    console.warn('Unexpected response format:', response.data);
                    setGenres([]);
                }
            } catch (err) {
                console.error('Error fetching top genres:', err);
                setError('No se pudieron cargar los géneros.');
                setGenres([]);
            }
        };

        fetchGenres();
    }, [timeRange]);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <Section>
            <Title>Top Géneros</Title>
            {genres.length > 0 ? (
                <GenresContainer>
                    {genres.map((genre, index) => (
                        <GenreBadge key={index}>{genre}</GenreBadge>
                    ))}
                </GenresContainer>
            ) : (
                <p>No se encontraron géneros.</p>
            )}
        </Section>
    );
};

export default TopGenres;