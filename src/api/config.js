// 환경변수 래퍼
// VITE_USE_MOCK=true 이면 api 함수들이 mocks/db.js 를 사용
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
export const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY ?? "";
export const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN ?? "";
export const PADDLE_ENVIRONMENT = import.meta.env.VITE_PADDLE_ENVIRONMENT ?? "sandbox";
