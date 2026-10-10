// 게시물 활동 관련 api들...
// TODO 주석은 나중에 api 연결 시 수정해야 하는 부분들 표시해둔 거라서!! 신경 안 쓰셔도 됩니당 !!

import api from "./axios";
import { USE_MOCK } from "./config";
import { db, delay, persist } from "../mocks/db";

// 내가 작성한 게시물 목록
export const fetchMyPosts = async () => {
  if (USE_MOCK) {
    await delay(250);
    return [...db.myPosts];
  }
  const { data } = await api.get("/posts/me"); // TODO(BE)
  return data;
};

// 내가 작성한 게시물 1건
export const fetchMyPost = async (id) => {
  if (USE_MOCK) {
    await delay(200);
    const post = db.myPosts.find((p) => p.id === id);
    if (!post) throw new Error("게시물을 찾을 수 없어요");
    return { ...post };
  }
  const { data } = await api.get(`/posts/${id}`); // TODO(BE)
  return data;
};

export const deleteMyPost = async (id) => {
  if (USE_MOCK) {
    await delay(300);
    db.myPosts = db.myPosts.filter((p) => p.id !== id);
    persist();
    return { ok: true };
  }
  await api.delete(`/posts/${id}`); // TODO(BE)
  return { ok: true };
};

// 저장(북마크)한 게시물 목록
export const fetchSavedPosts = async () => {
  if (USE_MOCK) {
    await delay(250);
    return [...db.savedPosts];
  }
  const { data } = await api.get("/posts/saved"); // TODO(BE)
  return data;
};

// 저장 취소 (하트 클릭)
export const unsavePost = async (id) => {
  if (USE_MOCK) {
    await delay(150);
    db.savedPosts = db.savedPosts.filter((p) => p.id !== id);
    persist();
    return { ok: true };
  }
  await api.delete(`/posts/${id}/save`); // TODO(BE)
  return { ok: true };
};
