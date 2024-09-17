// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Login from './components/Login';
import Stats from './components/stats';
import Callback from './components/Callback';
import FileUpload from './components/FileUpload';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #181818;
  min-height: 100vh;
  color: #ffffff;
`;

const App = () => {
  return (
    <Container>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </Container>
  );
};

export default App;
