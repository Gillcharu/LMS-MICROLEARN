import axios from 'axios';

const configuredBase = import.meta.env.VITE_API_URL;
const fallbackBases = ['http://localhost:5050/api', 'http://localhost:5000/api', 'http://localhost:4000/api'];
const candidates = [configuredBase, ...fallbackBases]
  .filter(Boolean)
  .filter((v, i, arr) => arr.indexOf(v) === i);
let activeBaseIndex = 0;

export const api = axios.create({ baseURL: candidates[activeBaseIndex] });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('microlearn_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.baseURL = candidates[activeBaseIndex];
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const canRetry =
      !error.response &&
      activeBaseIndex < candidates.length - 1 &&
      !error.config?._baseRetried;

    if (canRetry) {
      activeBaseIndex += 1;
      const retryConfig = { ...error.config, _baseRetried: true, baseURL: candidates[activeBaseIndex] };
      return api.request(retryConfig);
    }

    return Promise.reject(error);
  }
);
