// src/components/TopArtists.js
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
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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

const CardImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const CardInfo = styled.div`
  padding: 15px;
  text-align: center;
`;

const ArtistName = styled.h3`
  font-size: 1.1em;
  margin: 0;
  color: #1DB954;
`;

const TopArtists = () => {
    const [artists, setArtists] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('/top-artists')
            .then(response => {
                setArtists(response.data.items);
            })
            .catch(err => {
                console.error('Error fetching top artists:', err);
                setError('No se pudieron cargar los artistas.');
            });
    }, []);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <Section>
            <Title>Top Artistas</Title>
            <Grid>
                {artists.map(artist => (
                    <Card key={artist.id}>
                        <CardImage src={artist.images[0]?.url || 'https://via.placeholder.com/150'} alt={artist.name} />
                        <CardInfo>
                            <ArtistName>{artist.name}</ArtistName>
                        </CardInfo>
                    </Card>
                ))}
            </Grid>
        </Section>
    );
};

export default TopArtists;
