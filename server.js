const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const path = require('path');
const cookieParser = require('cookie-parser');
const config = require('./config');

const app = express();

const redirectUri = config.spotifyRedirectUri;
const clientId = config.spotifyClientId;
const clientSecret = config.spotifyClientSecret;

app.use(cookieParser());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    const scopes = 'user-top-read playlist-read-private';
    const authUrl = `https://accounts.spotify.com/authorize?` +
        querystring.stringify({
            response_type: 'code',
            client_id: clientId,
            scope: scopes,
            redirect_uri: redirectUri,
        });

    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code || null;

    if (!code) {
        return res.status(400).json({ error: 'No authorization code provided' });
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token',
            new URLSearchParams({
                code: code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            }),
            {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const accessToken = response.data.access_token;

        res.cookie('access_token', accessToken, { httpOnly: true, secure: false });
        res.redirect('/top-artists');
    } catch (error) {
        console.error('Error during authentication or fetching data:', error);
        res.status(500).json({ error: 'Authentication failed or failed to fetch data' });
    }
});

// Ruta para obtener los artistas más escuchados
app.get('/top-artists', async (req, res) => {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
        return res.status(400).json({ error: 'No access token provided' });
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching top artists:', error);
        res.status(500).json({ error: 'Failed to fetch top artists' });
    }
});

// Ruta para obtener las canciones más escuchadas
app.get('/top-tracks', async (req, res) => {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
        return res.status(400).json({ error: 'No access token provided' });
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching top tracks:', error);
        res.status(500).json({ error: 'Failed to fetch top tracks' });
    }
});

// Ruta para obtener los géneros más escuchados (nota: Spotify no proporciona géneros directos)
app.get('/top-genres', async (req, res) => {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
        return res.status(400).json({ error: 'No access token provided' });
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const genres = new Set();
        response.data.items.forEach(artist => {
            artist.genres.forEach(genre => genres.add(genre));
        });

        res.json({ genres: Array.from(genres) });
    } catch (error) {
        console.error('Error fetching top genres:', error);
        res.status(500).json({ error: 'Failed to fetch top genres' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
