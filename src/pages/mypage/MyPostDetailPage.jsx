import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomCTA from "../../components/BottomCTA";
import Button from "../../components/Button";
import ConfirmDialog from "../../components/ConfirmDialog";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import PageLayout from "../../components/PageLayout";
import useToast from "../../hooks/useToast";
import { useDeleteMyPost, useMyPostQuery } from "../../hooks/useActivity";
import { formatMonthDay, timeAgo } from "../../utils/format";

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
        <main className="min-h-screen px-[26px] pt-[73px] pb-40 text-[#353331]">
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
              <p className="mt-[22px] whitespace-pre-line text-[16px] leading-[1.55] tracking-[-0.32px] text-[#62605F]">
                {post.message}
              </p>

              {(post.tagLabel || post.region) && (
                <p className="mt-[12px] text-[13px] leading-[18px] text-[#8F8E8D]">
                  {[post.tagLabel, typeof post.region === "string" ? post.region : post.region?.shortName]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}

              {post.image ? (
                <img
                  src={post.image}
                  alt="게시물 첨부 이미지"
                  className="mt-[22px] aspect-[346/212] w-full rounded-[13px] object-cover"
                />
              ) : (
                <div
                  aria-label="첨부 이미지 없음"
                  className="mt-[22px] aspect-[346/212] w-full rounded-[13px] bg-[#E9E8E8]"
                />
              )}

              <div className="mt-[22px] border-t border-[#E9E8E8] pt-[18px]">
                <div className="flex items-center justify-between">
                  <span className="text-[17px] font-semibold tracking-[-0.34px]">
                    {formatMonthDay(post.createdAt)}
                  </span>
                  <span className="text-[15px] tracking-[-0.3px] text-[#A5A4A3]">
                    {post.createdAtDisplay ?? timeAgo(post.createdAt)}
                  </span>
                </div>
                <p className="mt-[18px] text-[15px] tracking-[-0.3px] text-[#797776]">
                  스크랩 {post.scraps ?? post.likes ?? 0}
                </p>
              </div>
            </>
          )}
        </main>

        {post && (
          <BottomCTA bottomClassName="bottom-[124px]">
            <Button onClick={() => setIsDeleteDialogOpen(true)} disabled={deletePost.isPending}>
              {deletePost.isPending ? "삭제 중..." : "삭제하기"}
            </Button>
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
