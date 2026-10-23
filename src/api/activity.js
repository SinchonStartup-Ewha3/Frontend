// 게시물 활동 관련 api들...
// TODO 주석은 나중에 api 연결 시 수정해야 하는 부분들 표시해둔 거라서!! 신경 안 쓰셔도 됩니당 !!

import api from "./axios";
import { USE_MOCK } from "./config";
import { db, delay, persist } from "../mocks/db";
import { toggleCommunityPostLike } from "./community";

const toMyPostModel = (post) => ({
  ...post,
  id: post.postId ?? post.id,
  message: post.content ?? post.message,
  image: post.imageUrl ?? post.image ?? null,
  likes: post.likeCount ?? post.likes ?? post.scraps ?? 0,
  scraps: post.likeCount ?? post.scraps ?? 0,
});

// 내가 작성한 게시물 목록
export const fetchMyPosts = async ({ page = 1, pageSize = 10 } = {}) => {
  if (USE_MOCK) {
    await delay(250);
    const posts = [...db.myPosts];
    const start = (page - 1) * pageSize;
    return {
      count: posts.length,
      next: start + pageSize < posts.length ? true : null,
      previous: page > 1 ? true : null,
      results: posts.slice(start, start + pageSize),
    };
  }
  const { data } = await api.get("/api/community/posts/mine/", {
    params: { page, pageSize },
  });
  return { ...data, results: (data.results ?? []).map(toMyPostModel) };
};

// 내가 작성한 게시물 1건
export const fetchMyPost = async (id) => {
  if (USE_MOCK) {
    await delay(200);
    const post = db.myPosts.find((p) => p.id === id);
    if (!post) throw new Error("게시물을 찾을 수 없어요");
    return { ...post };
  }
  const { data } = await api.get(`/api/community/posts/${id}/`);
  return toMyPostModel(data);
};

export const deleteMyPost = async (id) => {
  if (USE_MOCK) {
    await delay(300);
    db.myPosts = db.myPosts.filter((p) => p.id !== id);
    db.savedPosts = db.savedPosts.filter((p) => p.id !== id);
    persist();
    return { ok: true };
  }
  await api.delete(`/api/community/posts/${id}/`);
};

// 좋아요한 게시물 목록
export const fetchLikedPosts = async ({ page = 1, pageSize = 10 } = {}) => {
  if (USE_MOCK) {
    await delay(250);
    const posts = [...db.savedPosts];
    const start = (page - 1) * pageSize;
    return {
      count: posts.length,
      next: start + pageSize < posts.length ? true : null,
      previous: page > 1 ? true : null,
      results: posts.slice(start, start + pageSize).map((post) => ({ ...post, isLiked: true })),
    };
  }
  const { data } = await api.get("/api/community/posts/liked/", {
    params: { page, pageSize },
  });
  return { ...data, results: (data.results ?? []).map(toMyPostModel) };
};

// 좋아요 취소 (좋아요 API는 현재 상태를 토글)
export const unlikePost = async (id) => {
  if (USE_MOCK) {
    await delay(150);
    db.savedPosts = db.savedPosts.filter((p) => p.id !== id);
    persist();
    return { ok: true };
  }
  return toggleCommunityPostLike(id);
};
