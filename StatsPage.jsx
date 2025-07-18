import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { getAllUrlEntries } from './storage';
import { logEvent } from './loggingMiddleware';

function Row({ url }) {
  const [open, setOpen] = useState(false);

  const formatTimestamp = (ts) => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return '';
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)} aria-label="expand row">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <a href={`/s/${url.shortId}`} target="_blank" rel="noopener noreferrer">
            {window.location.origin}/s/{url.shortId}
          </a>
        </TableCell>
        <TableCell>{url.originalUrl}</TableCell>
        <TableCell>
          {url.expiryTimestamp
            ? new Date(url.expiryTimestamp).toLocaleString()
            : 'No expiry'}
        </TableCell>
        <TableCell>{url.clicks}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} sx={{ paddingBottom: 0, paddingTop: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="subtitle1" gutterBottom component="div">
                Click Details
              </Typography>
              {url.clickDetails.length === 0 ? (
                <Typography>No clicks recorded.</Typography>
              ) : (
                <Table size="small" aria-label="click details">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Geo Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {url.clickDetails.map((click, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatTimestamp(click.timestamp)}</TableCell>
                        <TableCell>{click.source || 'Unknown'}</TableCell>
                        <TableCell>{click.geo || 'Unknown'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function StatsPage() {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    setUrls(getAllUrlEntries());
    logEvent({ type: 'VIEW_STATS_PAGE' });
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        URL Shortener Statistics
      </Typography>
      {urls.length === 0 ? (
        <Typography>No shortened URLs found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="URL statistics table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Short URL</TableCell>
                <TableCell>Original URL</TableCell>
                <TableCell>Expiry Time</TableCell>
                <TableCell>Clicks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urls.map((url) => (
                <Row key={url.shortId} url={url} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default StatsPage;