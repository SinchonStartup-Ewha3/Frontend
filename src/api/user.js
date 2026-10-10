// 유저 관련 api...
// TODO 주석은 나중에 api 연결 시 수정해야 하는 부분들 표시해둔 거라서!! 신경 안 쓰셔도 됩니당 !!
import api from "./axios";
import { USE_MOCK } from "./config";
import { db, delay, persist } from "../mocks/db";

// 내 프로필 조회
export const fetchProfile = async () => {
  if (USE_MOCK) {
    await delay();
    return { ...db.user };
  }
  // TODO(BE): 엔드포인트/응답 필드 확정 시 수정
  const { data } = await api.get("/users/me");
  return data;
};

// 프로필 수정 (nickname, region, profileImage)
export const updateProfile = async (payload) => {
  if (USE_MOCK) {
    await delay();
    db.user = { ...db.user, ...payload };
    persist();
    return { ...db.user };
  }
  const { data } = await api.patch("/users/me", payload);
  return data;
};

// 회원 탈퇴
export const withdrawUser = async () => {
  if (USE_MOCK) {
    await delay();
    localStorage.removeItem("wee:mock-db:v1");
    return { ok: true };
  }
  await api.delete("/users/me");
  return { ok: true };
};
