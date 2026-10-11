// 커뮤니티 게시물 활동 관련 custom hook
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteMyPost,
  fetchMyPost,
  fetchMyPosts,
  fetchSavedPosts,
  unsavePost,
} from "../api/activity";
import queryKeys from "../api/queryKeys";

// 내가 작성한 게시물 목록 / 상세
export const useMyPostsQuery = () =>
  useQuery({ queryKey: queryKeys.myPosts, queryFn: fetchMyPosts });
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.myPosts }),
  });
};

// 저장한 게시물 목록 / 저장 취소 (하트 클릭 -> 목록에서 바로 사라지게 업데이트)
export const useSavedPostsQuery = () =>
  useQuery({ queryKey: queryKeys.savedPosts, queryFn: fetchSavedPosts });

export const useUnsavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unsavePost,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.savedPosts });
      const previous = queryClient.getQueryData(queryKeys.savedPosts);
      queryClient.setQueryData(queryKeys.savedPosts, (old = []) =>
        old.filter((p) => p.id !== id),
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.savedPosts, ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.savedPosts }),
  });
};
