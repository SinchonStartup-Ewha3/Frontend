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
  const { data } = await api.get("/api/users/me/");
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

//닉네임 설정
export const updateNickname = async (nickname) => {
  const normalizedNickname = nickname.trim();
  if (USE_MOCK) {
    await delay();
    db.user = { ...db.user, nickname: normalizedNickname };
    persist();
    return {
      ...db.user,
      userId: db.user.userId ?? db.user.id,
      isNicknameSet: true,
      isOnboarded: Boolean(db.user.region),
    };
  }
  const { data } = await api.patch("/api/users/me/nickname/", {
    nickname: normalizedNickname,
  });
  return data;
};

// 프로필 사진 업로드
export const uploadProfileImage = async (file) => {
  if (USE_MOCK) {
    await delay();
    const profileImage = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("이미지를 읽지 못했어요."));
      reader.readAsDataURL(file);
    });
    db.user = { ...db.user, profileImage };
    persist();
    return { ...db.user };
  }

  const formData = new FormData();
  formData.append("profileImage", file);
  const { data } = await api.patch("/api/users/me/profile-image/", formData);
  return data;
};

// 직접 올린 프로필 사진 삭제 후 카카오 프로필 사진으로 복원
export const deleteProfileImage = async () => {
  if (USE_MOCK) {
    await delay();
    db.user = { ...db.user, profileImage: null };
    persist();
    return { ...db.user };
  }

  const { data } = await api.delete("/api/users/me/profile-image/");
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
