// TODO 주석은 나중에 api 연결 시 수정해야 하는 부분들 표시해둔 거라서!! 신경 안 쓰셔도 됩니당 !!
import axios from "axios";
import { API_URL } from "./config";

// 공통 axios 인스턴스. baseURL / 쿠키 / 토큰 헤더를 여기서 한 번에 관리
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // TODO(BE): 인증 방식(쿠키/JWT) 확정되면 수정
  timeout: 10_000,
});

const refreshApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10_000,
});

const REFRESH_URL = "/api/auth/token/refresh/";
let refreshPromise = null;

const clearSession = () => {
  localStorage.removeItem("wee_access_token");
  localStorage.removeItem("wee_refresh_token");
};

const returnToLogin = () => {
  clearSession();
  window.location.assign("/");
};

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("wee_access_token");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    const accessToken = localStorage.getItem("wee_access_token");
    if (!accessToken) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      returnToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshToken = localStorage.getItem("wee_refresh_token");
    if (!refreshToken) {
      returnToLogin();
      return Promise.reject(error);
    }

    if (!refreshPromise) {
      refreshPromise = refreshApi
        .post(REFRESH_URL, { refresh: refreshToken })
        .then(({ data }) => {
          if (!data.access) {
            throw new Error("Access Token 갱신 응답에 access 값이 없습니다.");
          }
          localStorage.setItem("wee_access_token", data.access);
          return data.access;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      const newAccessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      if (refreshError.response?.status === 401) {
        returnToLogin();
      }
      return Promise.reject(refreshError);
    }
  },
);

export default api;
