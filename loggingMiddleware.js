const LOG_STORAGE_KEY = 'react-url-shortener-logs';

function loadLogs() {
  const logs = localStorage.getItem(LOG_STORAGE_KEY);
  if (!logs) return [];
  try {
    return JSON.parse(logs);
  } catch {
    return [];
  }
}

function saveLogs(logs) {
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
}

export function logEvent(event) {
  const logs = loadLogs();
  const timestamp = new Date().toISOString();
  logs.push({ timestamp, ...event });
  saveLogs(logs);
}

export function getLogs() {
  return loadLogs();
}