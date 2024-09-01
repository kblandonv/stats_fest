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

const TracksContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const TrackItem = styled.div`
  background-color: #282828;
  color: white;
  padding: 10px;
  border-radius: 8px;
`;

const RecentStreams = () => {
    const [tracks, setTracks] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const response = await axios.get('/recent-streams');
                setTracks(response.data.items);
            } catch (err) {
                console.error('Error fetching recent streams:', err);
                setError('No se pudieron cargar los streams recientes.');
            }
        };

        fetchTracks();
    }, []);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <Section>
            <Title>Recent Streams</Title>
            {tracks.length > 0 ? (
                <TracksContainer>
                    {tracks.map((item, index) => (
                        <TrackItem key={index}>
                            {item.track.name} - {item.track.artists.map(artist => artist.name).join(', ')}
                        </TrackItem>
                    ))}
                </TracksContainer>
            ) : (
                <p>No se encontraron streams recientes.</p>
            )}
        </Section>
    );
};

export default RecentStreams;
