const STORAGE_KEY = 'react-url-shortener-data';

export function loadData() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return { urls: [] };
  try {
    return JSON.parse(data);
  } catch {
    return { urls: [] };
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Add a new shortened URL entry
export function addUrlEntry(entry) {
  const data = loadData();
  data.urls.push(entry);
  saveData(data);
}

// Update an existing URL entry by shortId
export function updateUrlEntry(shortId, updateFn) {
  const data = loadData();
  const index = data.urls.findIndex(u => u.shortId === shortId);
  if (index === -1) return false;
  data.urls[index] = updateFn(data.urls[index]);
  saveData(data);
  return true;
}

// Get URL entry by shortId
export function getUrlEntry(shortId) {
  const data = loadData();
  return data.urls.find(u => u.shortId === shortId);
}

// Get all URL entries
export function getAllUrlEntries() {
  const data = loadData();
  return data.urls;
}