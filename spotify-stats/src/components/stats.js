import React, { useEffect, useState } from 'react';
import TopArtists from './TopArtists';
import TopTracks from './TopTracks';
import TopGenres from './TopGenres';
import RecentStreams from './RecentStreams';
import UserProfile from './UserProfile';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';

const TimeRangeSelector = styled.select`
  margin: 20px auto;
  padding: 10px;
  font-size: 1em;
  border-radius: 5px;
  display: block;
  width: 200px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const UploadButton = styled(Link)`
  display: inline-block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #1DB954;
  color: white;
  text-align: center;
  font-size: 1em;
  border-radius: 5px;
  text-decoration: none;
  &:hover {
    background-color: #17a741;
  }
`;

const Stats = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [timeRange, setTimeRange] = useState('medium_term');
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:4000/check-auth', {
                    credentials: 'include'
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
        <Container>
            <UserProfile />
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Tus Estadísticas de Spotify</h1>

            <UploadButton to="/upload">Upload Your Spotify Data</UploadButton>

            <TimeRangeSelector
                onChange={(e) => setTimeRange(e.target.value)}
                value={timeRange}
            >
                <option value="short_term">Últimas 4 semanas</option>
                <option value="medium_term">Últimos 6 meses</option>
                <option value="long_term">Todo el tiempo</option>
            </TimeRangeSelector>

            <TopArtists timeRange={timeRange} />
            <TopTracks timeRange={timeRange} />
            <TopGenres timeRange={timeRange} />
            <RecentStreams />
        </Container>
    );
};

export default Stats;
