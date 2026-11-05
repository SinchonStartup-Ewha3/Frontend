import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCommunityPost, toggleCommunityPostLike } from "../../api/community";
import queryKeys from "../../api/queryKeys";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import LoginRequiredModal from "../../components/LoginRequiredModal";
import MobileLayout from "../../components/MobileLayout";
import PostDetailContent from "../../components/PostDetailContent";
import PostOwnerActions from "../../components/PostOwnerActions";
import useToast from "../../hooks/useToast";
import starIcon from "../../assets/icons/star.svg";

export default function CommunityPostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [loginReturnTo, setLoginReturnTo] = useState(`/community/${postId}`);
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
      setLoginReturnTo(`/community/${postId}`);
      setIsLoginPromptOpen(true);
      return;
    }
    if (!likeMutation.isPending) likeMutation.mutate();
  };

  return (
    <MobileLayout>
      <main className="mx-auto flex min-h-[max(852px,100dvh)] w-full max-w-[390px] flex-col px-6 pt-[73px] pb-[137px] text-[#353331]">
        <Header back onLeft={() => {
          if (window.history.state?.idx > 0) navigate(-1);
          else navigate("/community", { replace: true });
        }} />
        <h1 className="sr-only">글 상세보기</h1>

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
          <PostDetailContent post={post} layout="community">
              <button
                type="button"
                onClick={toggleLike}
                disabled={likeMutation.isPending}
                aria-pressed={Boolean(post.isLiked)}
                aria-label={post.isLiked ? "공감 취소" : "공감"}
                aria-busy={likeMutation.isPending}
                className="relative inline-flex min-h-9 items-center gap-[7px] before:absolute before:-inset-x-1 before:-inset-y-1 disabled:opacity-50"
              >
                {post.isLiked ? (
                  <svg width="16" height="16" viewBox="0 0 13 13" fill="#60E1FF" aria-hidden="true">
                    <path d="M9.425 0C11.3994 0 13 1.64696 13 3.9527C13 8.56419 8.125 11.1993 6.5 12.1875C4.875 11.1993 0 8.56419 0 3.9527C0 1.64696 1.625 0 3.575 0C4.78398 0 5.85 0.658784 6.5 1.31757C7.15 0.658784 8.216 0 9.425 0Z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60E1FF" strokeWidth="2" aria-hidden="true">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                  </svg>
                )}
                <span>{post.likeCount ?? post.likes ?? 0}</span>
              </button>
          </PostDetailContent>
        ) : null}
        {post && !notFound && !postQuery.isError && (
          <div className="mt-auto pt-8">
            {post.isMine === true && (
              <div className="mb-6">
                <PostOwnerActions post={post} postId={postId} returnTo="/community" />
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                if (localStorage.getItem("wee_access_token")) navigate("/weather-fortune");
                else {
                  setLoginReturnTo("/weather-fortune");
                  setIsLoginPromptOpen(true);
                }
              }}
              aria-label="오늘의 날씨 운세 열기"
              className="relative flex h-[80px] w-full items-center justify-between gap-3 rounded-[20px] border border-[#F3F3F3] bg-gradient-to-r from-[rgba(240,227,255,0.12)] to-[rgba(5,196,240,0.12)] px-[19px] text-left shadow-[0_4px_4px_rgba(0,0,0,0.1)]"
            >
              <span>
                <span className="block text-[16px] font-semibold leading-6 tracking-[-0.48px] text-[#62605F]">오늘의 날씨 운세</span>
                <span className="block text-[12px] font-medium leading-[18px] tracking-[-0.36px] text-[#8F8E8D]">오늘 나의 날씨 운세는 몇점일까?</span>
              </span>
              <img src={starIcon} alt="" className="mr-[14px] shrink-0" />
            </button>
          </div>
        )}
      </main>
      <BottomNav />
      <LoginRequiredModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        onLogin={() => navigate("/login", { state: { from: loginReturnTo } })}
      />
    </MobileLayout>
  );
}
