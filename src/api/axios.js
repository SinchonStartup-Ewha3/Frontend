// TODO 주석은 나중에 api 연결 시 수정해야 하는 부분들 표시해둔 거라서!! 신경 안 쓰셔도 됩니당 !!
import axios from "axios";
import { API_URL } from "./config";

// 공통 axios 인스턴스. baseURL / 쿠키 / 토큰 헤더를 여기서 한 번에 관리
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // TODO(BE): 인증 방식(쿠키/JWT) 확정되면 수정
  timeout: 10_000,
});

// TODO(BE): 토큰 헤더 추가 / 401 처리(재로그인) 등은 백엔드 명세 나오면 여기에
api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error),
);

export default api;
