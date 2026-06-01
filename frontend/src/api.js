import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// 요청마다 localStorage의 토큰을 Authorization 헤더에 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 응답 시 토큰 만료로 간주 → localStorage 초기화 후 로그인 화면으로
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
