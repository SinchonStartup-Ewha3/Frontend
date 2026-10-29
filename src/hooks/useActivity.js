// 커뮤니티 게시물 활동 관련 custom hook
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteMyPost,
  fetchMyPost,
  fetchMyPosts,
  fetchLikedPosts,
  unlikePost,
} from "../api/activity";
import { updateCommunityPost } from "../api/community";
import queryKeys from "../api/queryKeys";

// 내가 작성한 게시물 목록 / 상세
export const useMyPostsQuery = (page = 1, pageSize = 10, enabled = true) =>
  useQuery({
    queryKey: queryKeys.myPostsPage(page, pageSize),
    queryFn: () => fetchMyPosts({ page, pageSize }),
    enabled,
  });
export const useMyPostQuery = (id) =>
  useQuery({
    queryKey: queryKeys.myPost(id),
    queryFn: () => fetchMyPost(id),
    enabled: Boolean(id),
  });

export const useDeleteMyPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMyPost,
    retry: false,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myPosts });
      queryClient.invalidateQueries({ queryKey: queryKeys.likedPosts });
      queryClient.removeQueries({ queryKey: queryKeys.myPost(id) });
    },
  });
};

// 내 게시물 수정 (PATCH). 성공하면 관련 목록/상세 캐시를 새로고침
// -> 다 끝날 때까지 기다렸다가 화면 이동해서, 상세 화면에 옛날 내용이 잠깐 보이지 않게
export const useUpdateMyPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCommunityPost,
    retry: false,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.myPosts }), // 내 글 목록 + 상세
        queryClient.invalidateQueries({ queryKey: queryKeys.likedPosts }), // 좋아요한 글 목록
        queryClient.invalidateQueries({ queryKey: queryKeys.communityPosts }), // 커뮤니티 피드
      ]),
  });
};

// 좋아요한 게시물 목록
export const useLikedPostsQuery = (page = 1, pageSize = 10, enabled = true) =>
  useQuery({
    queryKey: queryKeys.likedPostsPage(page, pageSize),
    queryFn: () => fetchLikedPosts({ page, pageSize }),
    enabled,
    // 전역 staleTime(60초) 때문에 목록이 늦게 갱신되던 문제 → 화면에 들어올 때마다 새로 불러오도록 변경
    staleTime: 0,
    refetchOnMount: "always",
  });

// 좋아요 취소: 목록에서는 즉시 제거하고 실패하면 기존 데이터로 복구
export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unlikePost,
    retry: false,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.likedPosts });
      const previous = queryClient.getQueriesData({
        queryKey: queryKeys.likedPosts,
      });
      queryClient.setQueriesData({ queryKey: queryKeys.likedPosts }, (old) =>
        old
          ? {
              ...old,
              count: Math.max(0, (old.count ?? 1) - 1), // 총 개수/페이지 수도 같이 줄이기
              results: (old.results ?? []).filter((p) => p.id !== id),
            }
          : old,
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      ctx?.previous?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.likedPosts });
      // 커뮤니티 피드의 하트 상태도 바로 맞추기
      queryClient.invalidateQueries({ queryKey: queryKeys.communityPosts });
    },
  });
};
