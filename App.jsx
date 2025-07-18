import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import UrlShortenerPage from './UrlShortenerPage';
import StatsPage from './StatsPage';
import RedirectPage from './RedirectPage';

function App() {
  return (
    <Router>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            React URL Shortener
          </Typography>
          <Button color="inherit" href="/">Shorten URL</Button>
          <Button color="inherit" href="/stats">Statistics</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<UrlShortenerPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/s/:shortId" element={<RedirectPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;