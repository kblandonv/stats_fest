# Spotify Stats Application

![Spotify Stats](https://img.shields.io/badge/Spotify-Stats-green)

This project is a web application that allows users to view their most listened-to artists, tracks, and genres from Spotify. It also provides detailed statistics on streaming habits, such as the number of streams, different artists, minutes streamed, different tracks, and albums. The application segments data by time periods (4 weeks, 6 months, all time) and displays recently played tracks along with the user's Spotify profile picture and name.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- **Top Artists, Tracks, and Genres:** View your most listened-to artists, tracks, and genres.
- **Streaming Statistics:** Get insights into your streaming habits, including total streams, minutes streamed, and more.
- **Time Period Segmentation:** Filter your stats by different time ranges (4 weeks, 6 months, all time).
- **Recent Streams:** See the songs you've recently played.
- **User Profile:** Display your Spotify profile picture and name.
- **Clickable Links:** Click on any artist or track to open it directly in Spotify.

## Tech Stack

- **Backend:** Node.js with Express.js
- **Frontend:** React.js
- **Authentication:** OAuth 2.0 via Spotify API
- **API:** Spotify Web API

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine
- A Spotify Developer account with a registered app to get the `Client ID` and `Client Secret`

## Installation

To get started with the project, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/kblandonv/stats_fest.git
    cd stats_fest
    ```

2. **Install backend dependencies**:
    ```bash
    cd backend
    npm install
    ```

3. **Install frontend dependencies**:
    ```bash
    cd ../frontend
    npm install
    ```

4. **Set up environment variables**:
    - Create a `.env` file in the `backend` directory.
    - Add the following environment variables:
    ```bash
    SPOTIFY_CLIENT_ID=your_spotify_client_id
    SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
    SPOTIFY_REDIRECT_URI=http://localhost:4000/callback
    ```

5. **Run the backend server**:
    ```bash
    cd backend
    node server.js
    ```

6. **Run the frontend**:
    ```bash
    cd ../frontend
    npm start
    ```

   The frontend will be available on `http://localhost:3000`.

## Usage

- Open your browser and navigate to `http://localhost:3000`.
- Click on "Login with Spotify" to authenticate your account.
- Once authenticated, you will be redirected to the main dashboard where you can view your Spotify stats.

## API Endpoints

Here are the key API endpoints used in this project:

- **`GET /login`**: Redirects the user to Spotify's login page.
- **`POST /callback`**: Handles the OAuth2 callback and exchanges the authorization code for an access token.
- **`GET /top-artists`**: Fetches the user's top artists.
- **`GET /top-tracks`**: Fetches the user's top tracks.
- **`GET /top-genres`**: Fetches the user's top genres.
- **`GET /recent-streams`**: Fetches the user's recently played tracks.
- **`POST /refresh-token`**: Refreshes the Spotify access token when it expires.

## Project Structure

```bash
├── backend             # Backend code and server files
│   ├── server.js       # Main server file
│   ├── callback.js     # Handles the callback from Spotify's OAuth
│   ├── .env            # Environment variables
│   ├── package.json    # Backend dependencies
├── frontend            # Frontend code (React.js)
│   ├── public          # Static files served to the client
│   ├── src             # React components and main application code
│   ├── package.json    # Frontend dependencies
├── README.md           # Project documentation
└── .gitignore          # Files and directories to be ignored by Git
