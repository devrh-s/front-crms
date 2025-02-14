'use client';
import axios from 'axios';
import { useAuthStore } from '@/zustand/authStore';
import config from '@/config';

const { API_URL } = config;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.defaults.withCredentials = true;

axiosInstance.interceptors.request.use(
  (request) => {
    request.withCredentials = true;
    const token = useAuthStore.getState().token;
    if (!request.headers.Authorization && token) {
      request.headers.Authorization = 'Bearer ' + token;
    }
    return request;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    try {
      const token = useAuthStore.getState().token;
      if (token) {
        const response = await fetch(`${API_URL}/refresh-token`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        });
        const result = await response.json();
        const { token: newToken } = result;
        originalRequest.headers.Authorization = 'Bearer ' + newToken;
        useAuthStore.getState().setToken(newToken);
      }
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
