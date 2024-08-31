// src/components/TopTracks.js
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background-color: #282828;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }
`;

const AlbumImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const CardInfo = styled.div`
  padding: 15px;
  text-align: center;
`;

const TrackName = styled.h3`
  font-size: 1.1em;
  margin: 0;
  color: #1DB954;
`;

const ArtistName = styled.p`
  font-size: 0.9em;
  color: #b3b3b3;
  margin-top: 5px;
`;

const TopTracks = () => {
    const [tracks, setTracks] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('/top-tracks')
            .then(response => {
                setTracks(response.data.items);
            })
            .catch(err => {
                console.error('Error fetching top tracks:', err);
                setError('No se pudieron cargar las canciones.');
            });
    }, []);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <Section>
            <Title>Top Canciones</Title>
            <Grid>
                {tracks.map(track => (
                    <Card key={track.id}>
                        <AlbumImage src={track.album.images[0]?.url || 'https://via.placeholder.com/150'} alt={track.name} />
                        <CardInfo>
                            <TrackName>{track.name}</TrackName>
                            <ArtistName>{track.artists.map(artist => artist.name).join(', ')}</ArtistName>
                        </CardInfo>
                    </Card>
                ))}
            </Grid>
        </Section>
    );
};

export default TopTracks;