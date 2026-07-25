import axios from 'axios';

const api = axios.create({
  // Vite and Nginx proxy /api locally. Set VITE_API_URL only when the API is
  // deployed at a different origin.
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

export async function analyzeArticle(payload) {
  const { data } = await api.post('/analyze', payload);
  return data;
}

export async function askQuestion(payload) {
  const { data } = await api.post('/ask', payload);
  return data;
}

export async function uploadArticle(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function fetchUrl(url) {
  const { data } = await api.post('/fetch-url', { url });
  return data;
}

export async function fetchLatestNews(query) {
  const { data } = await api.get('/latest-news', { params: { query } });
  return data;
}
