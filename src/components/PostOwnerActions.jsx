import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Button from "./Button";
import ConfirmDialog from "./ConfirmDialog";
import { useDeleteMyPost } from "../hooks/useActivity";
import useToast from "../hooks/useToast";
import queryKeys from "../api/queryKeys";

export default function PostOwnerActions({ post, postId, returnTo = "/mypage/activity?type=written" }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const deletePost = useDeleteMyPost();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (post?.isMine !== true) return null;

  const handleDelete = () => {
    if (deletePost.isPending) return;
    deletePost.mutate(postId, {
      onSuccess: () => {
        toast.success("게시물을 삭제했어요.");
        navigate(returnTo, { replace: true });
      },
      onError: (error) => {
        setIsDeleteDialogOpen(false);
        const status = error.response?.status;
        toast.error(error.response?.data?.detail ?? (
          status === 404 ? "게시글을 찾을 수 없어요." :
          status === 403 ? "게시글 작성자만 삭제할 수 있습니다." :
          status === 401 ? "로그인이 필요해요." : "게시물을 삭제하지 못했어요."
        ));
        if (status === 404) navigate(returnTo, { replace: true });
        if (status === 403) {
          queryClient.invalidateQueries({ queryKey: queryKeys.myPost(postId) });
          queryClient.invalidateQueries({ queryKey: queryKeys.communityPost(postId) });
        }
      },
    });
  };

  return (
    <>
      <div className="flex gap-3">
        <Button variant="soft" onClick={() => navigate(`/community/edit/${postId}`)} disabled={deletePost.isPending}>
          수정하기
        </Button>
        <Button onClick={() => setIsDeleteDialogOpen(true)} disabled={deletePost.isPending}>
          {deletePost.isPending ? "삭제 중..." : "삭제하기"}
        </Button>
      </div>
      <ConfirmDialog isOpen={isDeleteDialogOpen} variant="postDelete" cancelTone="light" loading={deletePost.isPending}
        onCancel={() => setIsDeleteDialogOpen(false)} onConfirm={handleDelete} />
    </>
  );
}
