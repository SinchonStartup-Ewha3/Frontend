// 커뮤니티 게시물 활동 관련 custom hook
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteMyPost,
  fetchMyPost,
  fetchMyPosts,
  fetchLikedPosts,
  unlikePost,
} from "../api/activity";
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

// 좋아요한 게시물 목록
export const useLikedPostsQuery = (page = 1, pageSize = 10, enabled = true) =>
  useQuery({
    queryKey: queryKeys.likedPostsPage(page, pageSize),
    queryFn: () => fetchLikedPosts({ page, pageSize }),
    enabled,
  });

// 좋아요 취소: 목록에서는 즉시 제거하고 실패하면 기존 데이터로 복구
export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unlikePost,
    retry: false,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.likedPosts });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.likedPosts });
      queryClient.setQueriesData({ queryKey: queryKeys.likedPosts }, (old) =>
        old ? { ...old, results: (old.results ?? []).filter((p) => p.id !== id) } : old,
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      ctx?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.likedPosts }),
  });
};
