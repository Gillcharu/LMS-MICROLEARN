import axios from 'axios';

const configuredBase = import.meta.env.VITE_API_URL;
const baseURL = configuredBase || 'http://localhost:4000/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('microlearn_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.baseURL = baseURL;
  return config;
});
