import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUrlEntry, updateUrlEntry } from './storage';
import { logEvent } from './loggingMiddleware';
import { Typography, Box } from '@mui/material';

function getCoarseGeo() {
  // Use browser's Intl API or fallback to 'Unknown'
  try {
    const locale = navigator.language || 'Unknown';
    return locale;
  } catch {
    return 'Unknown';
  }
}

function RedirectPage() {
  const { shortId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const urlEntry = getUrlEntry(shortId);
    if (!urlEntry) {
      logEvent({ type: 'REDIRECT_FAILED', shortId, reason: 'Not found' });
      navigate('/', { replace: true });
      return;
    }
    if (urlEntry.expiryTimestamp && Date.now() > urlEntry.expiryTimestamp) {
      logEvent({ type: 'REDIRECT_FAILED', shortId, reason: 'Expired' });
      navigate('/', { replace: true });
      return;
    }
    // Log click
    const clickDetail = {
      timestamp: Date.now(),
      source: document.referrer || 'Direct',
      geo: getCoarseGeo(),
    };
    updateUrlEntry(shortId, (entry) => {
      return {
        ...entry,
        clicks: entry.clicks + 1,
        clickDetails: [...entry.clickDetails, clickDetail],
      };
    });
    logEvent({ type: 'REDIRECT', shortId, originalUrl: urlEntry.originalUrl });
    // Redirect after a short delay to allow logging
    setTimeout(() => {
      window.location.href = urlEntry.originalUrl;
    }, 100);
  }, [shortId, navigate]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">Redirecting...</Typography>
    </Box>
  );
}

export default RedirectPage;