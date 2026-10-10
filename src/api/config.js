// 환경변수 래퍼
// VITE_USE_MOCK=true 이면 api 함수들이 mocks/db.js 를 사용
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
