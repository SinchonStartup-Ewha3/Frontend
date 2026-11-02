import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCommunityPost, toggleCommunityPostLike } from "../../api/community";
import queryKeys from "../../api/queryKeys";
import Header from "../../components/Header";
import LoginRequiredModal from "../../components/LoginRequiredModal";
import MobileLayout from "../../components/MobileLayout";
import PostDetailContent from "../../components/PostDetailContent";
import useToast from "../../hooks/useToast";
import heartIcon from "../../assets/icons/heart.svg";

export default function CommunityPostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const validId = /^[1-9]\d*$/.test(postId ?? "");
  const postQuery = useQuery({
    queryKey: queryKeys.communityPost(postId),
    queryFn: () => fetchCommunityPost(postId),
    enabled: validId,
    retry: false,
    refetchOnMount: "always",
  });
  const post = postQuery.data;
  const notFound = !validId || postQuery.error?.response?.status === 404;
  const likeMutation = useMutation({
    mutationFn: () => toggleCommunityPostLike(postId),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.communityPost(postId), (current) =>
        current ? { ...current, isLiked: result.isLiked, likeCount: result.likeCount } : current,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.communityPosts });
      queryClient.invalidateQueries({ queryKey: queryKeys.likedPosts });
      queryClient.invalidateQueries({ queryKey: queryKeys.myPosts });
    },
    onError: (error) => {
      if (error.response?.status === 404) {
        queryClient.invalidateQueries({ queryKey: queryKeys.communityPosts });
      }
      toast.error(error.response?.data?.detail ?? "공감을 변경하지 못했어요. 다시 시도해주세요.");
    },
  });
  const toggleLike = () => {
    if (!localStorage.getItem("wee_access_token")) {
      setIsLoginPromptOpen(true);
      return;
    }
    if (!likeMutation.isPending) likeMutation.mutate();
  };

  return (
    <MobileLayout>
      <main className="mx-auto min-h-screen w-full max-w-[390px] px-6 pt-[73px] pb-12 text-[#353331]">
        <Header back onLeft={() => {
          if (window.history.state?.idx > 0) navigate(-1);
          else navigate("/community", { replace: true });
        }} />
        <h1 className="mt-[18px] text-[24px] font-semibold leading-[1.4] tracking-[-0.72px]">
          게시글 상세
        </h1>

        {notFound ? (
          <div className="mt-8 text-sm text-[#797776]">
            <p role="alert">삭제되었거나 존재하지 않는 게시글이에요.</p>
            <Link to="/community" className="mt-3 inline-block text-[#19BBD8] underline">커뮤니티로 돌아가기</Link>
          </div>
        ) : postQuery.isPending ? (
          <p role="status" className="mt-8 text-sm text-[#A5A4A3]">게시글을 불러오는 중이에요.</p>
        ) : postQuery.isError ? (
          <div className="mt-8 text-sm text-[#797776]">
            <p role="alert">게시글을 불러오지 못했어요.</p>
            <button type="button" onClick={() => postQuery.refetch()} className="mt-3 text-[#19BBD8] underline">다시 시도</button>
          </div>
        ) : post ? (
          <PostDetailContent post={post}>
              <button
                type="button"
                onClick={toggleLike}
                disabled={likeMutation.isPending}
                aria-pressed={Boolean(post.isLiked)}
                aria-label={post.isLiked ? "공감 취소" : "공감"}
                aria-busy={likeMutation.isPending}
                className="flex min-h-11 items-center gap-2 rounded-full border border-[#E9E8E8] px-4 text-[14px] disabled:opacity-50"
              >
                {post.isLiked ? (
                  <svg width="16" height="16" viewBox="0 0 13 13" fill="#60E1FF" aria-hidden="true">
                    <path d="M9.425 0C11.3994 0 13 1.64696 13 3.9527C13 8.56419 8.125 11.1993 6.5 12.1875C4.875 11.1993 0 8.56419 0 3.9527C0 1.64696 1.625 0 3.575 0C4.78398 0 5.85 0.658784 6.5 1.31757C7.15 0.658784 8.216 0 9.425 0Z" />
                  </svg>
                ) : <img src={heartIcon} alt="" className="h-4 w-4" />}
                공감 {post.likeCount ?? post.likes ?? 0}
              </button>
          </PostDetailContent>
        ) : null}
      </main>
      <LoginRequiredModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        onLogin={() => navigate("/login", { state: { from: `/community/${postId}` } })}
      />
    </MobileLayout>
  );
}
