import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomCTA from "../../components/BottomCTA";
import Button from "../../components/Button";
import ConfirmDialog from "../../components/ConfirmDialog";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import PageLayout from "../../components/PageLayout";
import PostDetailContent from "../../components/PostDetailContent";
import useToast from "../../hooks/useToast";
import { useDeleteMyPost, useMyPostQuery } from "../../hooks/useActivity";

export default function MyPostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const postQuery = useMyPostQuery(postId);
  const deletePost = useDeleteMyPost();
  const post = postQuery.data;

  const handleDelete = () => {
    deletePost.mutate(postId, {
      onSuccess: () => {
        toast.success("게시물을 삭제했어요.");
        navigate("/mypage/activity?type=written", { replace: true });
      },
      onError: () => toast.error("게시물을 삭제하지 못했어요."),
    });
  };

  return (
    <MobileLayout>
      <PageLayout nav={false} className="!px-0 !pb-0">
        <main className="mx-auto min-h-screen w-full max-w-[390px] px-6 pt-[73px] pb-[200px] text-[#353331]">
          <Header back />

          {postQuery.isLoading && (
            <p className="mt-8 text-center text-sm text-[#A5A4A3]">
              게시물을 불러오는 중이에요.
            </p>
          )}
          {(postQuery.isError || (!postQuery.isLoading && !post)) && (
            <p className="mt-8 text-center text-sm text-[#A5A4A3]">
              게시물을 찾을 수 없어요.
            </p>
          )}

          {post && (
            <>
              <h1 className="mt-[18px] text-[24px] font-semibold leading-[1.4] tracking-[-0.72px]">
                작성한 게시물
              </h1>
              <PostDetailContent post={post} />
            </>
          )}
        </main>

        {post && (
          <BottomCTA bottomClassName="bottom-[124px]">
            <div className="flex gap-3">
              <Button
                variant="soft"
                onClick={() => navigate(`/community/edit/${postId}`)}
                disabled={deletePost.isPending}
              >
                수정하기
              </Button>
              <Button
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={deletePost.isPending}
              >
                {deletePost.isPending ? "삭제 중..." : "삭제하기"}
              </Button>
            </div>
          </BottomCTA>
        )}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          variant="postDelete"
          cancelTone="light"
          loading={deletePost.isPending}
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
        />
      </PageLayout>
    </MobileLayout>
  );
}
