import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { isValidUrl, generateShortId } from './urlUtils';
import {
  addUrlEntry,
  getAllUrlEntries,
  updateUrlEntry,
} from './storage';
import { logEvent } from './loggingMiddleware';

const MAX_URLS = 5;

function UrlShortenerPage() {
  const [inputs, setInputs] = useState([
    { originalUrl: '', expiryMinutes: '', error: '' },
  ]);
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    setShortenedUrls(getAllUrlEntries());
  }, []);

  const handleInputChange = (index, field, value) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    newInputs[index].error = '';
    setInputs(newInputs);
  };

  const validateInputs = () => {
    let valid = true;
    const newInputs = inputs.map(input => {
      let error = '';
      if (!input.originalUrl.trim()) {
        error = 'URL is required';
        valid = false;
      } else if (!isValidUrl(input.originalUrl.trim())) {
        error = 'Invalid URL format';
        valid = false;
      }
      if (input.expiryMinutes) {
        const num = Number(input.expiryMinutes);
        if (isNaN(num) || num <= 0) {
          error = 'Expiry must be a positive number';
          valid = false;
        }
      }
      return { ...input, error };
    });
    setInputs(newInputs);
    return valid;
  };

  const generateUniqueShortId = (existingShortIds) => {
    let shortId;
    let attempts = 0;
    do {
      shortId = generateShortId(6);
      attempts++;
      if (attempts > 10) {
        // fallback to longer id if collisions persist
        shortId = generateShortId(8);
      }
    } while (existingShortIds.has(shortId));
    return shortId;
  };

  const handleShorten = () => {
    if (!validateInputs()) {
      setSnackbar({ open: true, message: 'Please fix errors before shortening.', severity: 'error' });
      return;
    }
    const existingUrls = getAllUrlEntries();
    const existingShortIds = new Set(existingUrls.map(u => u.shortId));
    const existingOriginalUrls = new Set(existingUrls.map(u => u.originalUrl));

    const newEntries = [];
    for (const input of inputs) {
      const originalUrlTrimmed = input.originalUrl.trim();
        if (existingOriginalUrls.has(originalUrlTrimmed)) {
          setSnackbar({ open: true, message: `Duplicate URL skipped: ${originalUrlTrimmed}`, severity: 'warning' });
          continue;
        }
      const shortId = generateUniqueShortId(existingShortIds);
      existingShortIds.add(shortId);
      const expiryTimestamp = input.expiryMinutes
        ? Date.now() + Number(input.expiryMinutes) * 60 * 1000
        : null;
      const entry = {
        shortId,
        originalUrl: originalUrlTrimmed,
        expiryTimestamp,
        createdAt: Date.now(),
        clicks: 0,
        clickDetails: [],
      };
      addUrlEntry(entry);
      newEntries.push(entry);
      logEvent({ type: 'URL_SHORTENED', shortId, originalUrl: originalUrlTrimmed, expiryTimestamp });
    }
    if (newEntries.length > 0) {
      setShortenedUrls(getAllUrlEntries());
      setInputs([{ originalUrl: '', expiryMinutes: '', error: '' }]);
      setSnackbar({ open: true, message: 'URLs shortened successfully.', severity: 'success' });
    }
  };

  const handleAddInput = () => {
    if (inputs.length < MAX_URLS) {
      setInputs([...inputs, { originalUrl: '', expiryMinutes: '', error: '' }]);
    }
  };

  const handleRemoveInput = (index) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs.length > 0 ? newInputs : [{ originalUrl: '', expiryMinutes: '', error: '' }]);
  };

  const formatExpiry = (timestamp) => {
    if (!timestamp) return 'No expiry';
    const diff = timestamp - Date.now();
    if (diff <= 0) return 'Expired';
    const minutes = Math.ceil(diff / (60 * 1000));
    return `Expires in ${minutes} min`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>
      {inputs.map((input, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={7}>
              <TextField
                label="Original URL"
                fullWidth
                value={input.originalUrl}
                onChange={(e) => handleInputChange(index, 'originalUrl', e.target.value)}
                error={!!input.error}
                helperText={input.error}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Expiry (minutes)"
                fullWidth
                value={input.expiryMinutes}
                onChange={(e) => handleInputChange(index, 'expiryMinutes', e.target.value)}
                type="number"
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <IconButton onClick={() => handleRemoveInput(index)} aria-label="remove">
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      ))}
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={handleAddInput} disabled={inputs.length >= MAX_URLS}>
          Add URL
        </Button>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Button variant="contained" onClick={handleShorten}>
          Shorten URLs
        </Button>
      </Box>
      <Typography variant="h5" gutterBottom>
        Shortened URLs
      </Typography>
      {shortenedUrls.length === 0 && <Typography>No URLs shortened yet.</Typography>}
      {shortenedUrls.map((url) => (
        <Paper key={url.shortId} sx={{ p: 2, mb: 2 }}>
          <Typography>
            <strong>Short URL:</strong>{' '}
            <a href={`/s/${url.shortId}`} target="_blank" rel="noopener noreferrer">
              {window.location.origin}/s/{url.shortId}
            </a>
          </Typography>
          <Typography>
            <strong>Original URL:</strong> {url.originalUrl}
          </Typography>
          <Typography>
            <strong>Expiry:</strong> {formatExpiry(url.expiryTimestamp)}
          </Typography>
        </Paper>
      ))}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UrlShortenerPage;