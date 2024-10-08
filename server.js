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
    const scopes = 'user-read-recently-played user-top-read playlist-read-private user-read-email user-read-private';
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

app.get('/recent-streams', async (req, res) => {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
        return res.status(401).json({ error: 'No access token provided' });
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
            headers: { 'Authorization': 'Bearer ' + accessToken },
            params: { limit: 20 }  // Puedes ajustar el límite
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching recent streams:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            res.clearCookie('access_token');
            return res.status(401).json({ error: 'Token expired or invalid' });
        }
        res.status(500).json({ error: 'Failed to fetch recent streams' });
    }
});

app.get('/user-profile', async (req, res) => {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
        return res.status(401).json({ error: 'No access token provided' });
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching user profile:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            res.clearCookie('access_token');
            return res.status(401).json({ error: 'Token expired or invalid' });
        }
        res.status(500).json({ error: 'Failed to fetch user profile' });
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

const multer = require('multer');
const AdmZip = require('adm-zip');
const fs = require('fs');

// Configuración de Multer para manejar la subida de archivos
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        const filePath = path.join(__dirname, 'uploads', file.filename);

        // Verifica si el archivo es un ZIP
        if (file.mimetype === 'application/zip') {
            const zip = new AdmZip(filePath);
            const zipEntries = zip.getEntries(); // Obtener archivos dentro del ZIP

            // Procesar cada archivo JSON dentro del ZIP
            zipEntries.forEach((entry) => {
                if (entry.entryName.endsWith('.json')) {
                    const jsonData = JSON.parse(zip.readAsText(entry));
                    // Aquí procesa los datos del archivo JSON (reproducciones, minutos, etc.)
                    console.log(jsonData);
                }
            });

            return res.status(200).send('ZIP file processed successfully.');
        } else if (file.mimetype === 'application/json') {
            // Si es un archivo JSON
            const jsonData = JSON.parse(fs.readFileSync(filePath));
            console.log(jsonData);

            // Aquí procesa los datos del archivo JSON
            return res.status(200).send('JSON file processed successfully.');
        } else {
            return res.status(400).send('Unsupported file type. Please upload a JSON or ZIP file.');
        }
    } catch (error) {
        console.error('Error processing file:', error);
        return res.status(500).send('An error occurred while processing the file.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

