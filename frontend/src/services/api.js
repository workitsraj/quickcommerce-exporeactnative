import axios from 'axios';

// TODO: Move to environment-specific configuration
// For iOS simulator: http://localhost:3000/api
// For Android emulator: http://10.0.2.2:3000/api
// For physical device: http://YOUR_COMPUTER_IP:3000/api
const API_BASE_URL = 'http://localhost:3000/api';

// TODO: In production, implement proper authentication with JWT tokens
// For demo purposes - replace with actual user ID from authentication
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
