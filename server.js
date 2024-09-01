const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const path = require('path');
const cookieParser = require('cookie-parser');
const config = require('./config');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

const redirectUri = config.spotifyRedirectUri;
const clientId = config.spotifyClientId;
const clientSecret = config.spotifyClientSecret;

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://your-production-domain.com' : 'http://localhost:3000',
    credentials: true
}));

app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'spotify-stats', 'build')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'spotify-stats', 'build', 'index.html'));
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

app.post('/callback', async (req, res) => {
    const code = req.body.code || null;

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

        const { access_token, refresh_token } = response.data;

        res.cookie('access_token', access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.cookie('refresh_token', refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        res.json({ success: true });
    } catch (error) {
        console.error('Error during authentication:', error.response?.data || error.message);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

app.get('/check-auth', (req, res) => {
    const accessToken = req.cookies.access_token;
    if (accessToken) {
        res.status(200).json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

app.get('/top-artists', async (req, res) => {
    const accessToken = req.cookies.access_token;
    const timeRange = req.query.time_range || 'medium_term'; // Default to 6 months if not provided

    if (!accessToken) {
        return res.status(401).json({ error: 'No access token provided' });
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
            headers: { 'Authorization': 'Bearer ' + accessToken },
            params: { time_range: timeRange }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching top artists:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            res.clearCookie('access_token');
            return res.status(401).json({ error: 'Token expired or invalid' });
        }
        res.status(500).json({ error: 'Failed to fetch top artists' });
    }
});

app.get('/top-tracks', async (req, res) => {
    const accessToken = req.cookies.access_token;
    const timeRange = req.query.time_range || 'medium_term'; // Default to 6 months if not provided

    if (!accessToken) {
        return res.status(401).json({ error: 'No access token provided' });
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
            headers: { 'Authorization': 'Bearer ' + accessToken },
            params: { time_range: timeRange }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching top tracks:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            res.clearCookie('access_token');
            return res.status(401).json({ error: 'Token expired or invalid' });
        }
        res.status(500).json({ error: 'Failed to fetch top tracks' });
    }
});

app.get('/top-genres', async (req, res) => {
    const accessToken = req.cookies.access_token;
    const timeRange = req.query.time_range || 'medium_term';

    if (!accessToken) {
        return res.status(401).json({ error: 'No access token provided' });
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
            headers: { 'Authorization': 'Bearer ' + accessToken },
            params: { time_range: timeRange, limit: 50 }  // Get more artists for better genre representation
        });

        const artists = response.data.items;
        const genreCount = {};

        artists.forEach(artist => {
            artist.genres.forEach(genre => {
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            });
        });

        const sortedGenres = Object.entries(genreCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)  // Get top 10 genres
            .map(([genre]) => genre);

        res.json({ genres: sortedGenres });
    } catch (error) {
        console.error('Error fetching top genres:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            res.clearCookie('access_token');
            return res.status(401).json({ error: 'Token expired or invalid' });
        }
        res.status(500).json({ error: 'Failed to fetch top genres' });
    }
});

app.get('/refresh-token', async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided' });
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            }),
            {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, refresh_token } = response.data;

        res.cookie('access_token', access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        if (refresh_token) {
            res.cookie('refresh_token', refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error refreshing token:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'spotify-stats', 'build', 'index.html'));
});

// Manejo de errores para rutas no encontradas
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'spotify-stats', 'build', 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});