import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// For demo purposes - in production, use proper authentication
const getUserId = () => {
  return 'user123'; // Replace with actual user ID from authentication
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include user ID
apiClient.interceptors.request.use(
  (config) => {
    config.headers['x-user-id'] = getUserId();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
