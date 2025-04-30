import axios from 'axios';

const api = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// api.interceptors.request.use((config) => {
//   const token = 'Pegar do locaolStorage ou do AsyncStorage no React Native';
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;
