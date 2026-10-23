import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BottomNav from "../../components/BottomNav";
import Card from "../../components/Card";
import Chip from "../../components/Chip";
import MobileLayout from "../../components/MobileLayout";
import heartIcon from "../../assets/icons/heart.svg";
import modifyIcon from "../../assets/icons/modify.svg";
import diamondIcon from "../../assets/icons/diamond.svg";
import LoginRequiredModal from "../../components/LoginRequiredModal";
import { fetchCommunityPosts, fetchCommunityWeatherCopy, toggleCommunityPostLike } from "../../api/community";
import useToast from "../../hooks/useToast";

const categories = [
  { label: "가디건", value: "cardigan" },
  { label: "패딩", value: "padded" },
  { label: "코트", value: "coat" },
];

export default function CommunityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isLoggedIn = Boolean(localStorage.getItem("wee_access_token"));
  const [activeCategory, setActiveCategory] = useState("cardigan");
  const [page, setPage] = useState(1);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [loginReturnTo, setLoginReturnTo] = useState("/community");
  const [pendingLikeIds, setPendingLikeIds] = useState(() => new Set());
  const toast = useToast();
  const postsQuery = useQuery({
    queryKey: ["community", "posts", activeCategory, page, 10],
    queryFn: () => fetchCommunityPosts({ tag: activeCategory, page, pageSize: 10 }),
    enabled: isLoggedIn,
    retry: false,
    refetchOnMount: "always",
  });
  const weatherCopyQuery = useQuery({
    queryKey: ["community", "weather-copy"],
    queryFn: fetchCommunityWeatherCopy,
    enabled: isLoggedIn,
    retry: false,
  });
  const weatherCopy = isLoggedIn ? weatherCopyQuery.data : null;
  const headline = weatherCopy?.headline ?? {
    title: "뚝 떨어진 기온에",
    description: "얇은 아우터와 우산을 추천해요",
  };
  const premiumCard = weatherCopy?.premiumCard ?? {
    message: "멋사님 우산 챙기셨나요?",
    subMessage: "이미 많은 사람들이 알림 기능을 사용하고 있어요",
    targetUrl: "/premium",
  };
  const premiumTarget = typeof premiumCard.targetUrl === "string" &&
    premiumCard.targetUrl.startsWith("/") && !premiumCard.targetUrl.startsWith("//")
    ? premiumCard.targetUrl
    : "/premium";
  const visiblePosts = postsQuery.data?.results ?? [];
  const pageCount = Math.max(1, Math.ceil((postsQuery.data?.count ?? 0) / 10));

  useEffect(() => {
    if (weatherCopyQuery.error?.response?.data?.code === "COMMUNITY_LOCATION_REQUIRED") {
      navigate("/location-setup", { replace: true, state: { from: "/community" } });
    }
  }, [navigate, weatherCopyQuery.error]);

  const toggleLike = async (post) => {
    if (!isLoggedIn) {
      setLoginReturnTo(location.pathname);
      setIsLoginPromptOpen(true);
      return;
    }
    const postId = Number(post.postId ?? post.id);
    if (!Number.isSafeInteger(postId) || postId <= 0) {
      toast.error("게시글 정보를 확인할 수 없어 좋아요를 반영하지 못했어요.");
      return;
    }
    if (pendingLikeIds.has(postId)) return;
    setPendingLikeIds((current) => {
      const next = new Set(current);
      next.add(postId);
      return next;
    });
    try {
      const result = await toggleCommunityPostLike(postId);
      queryClient.setQueryData(["community", "posts", activeCategory, page, 10], (current) => current && ({
        ...current,
        results: current.results.map((item) => Number(item.postId) === postId
          ? { ...item, isLiked: result.isLiked, likeCount: result.likeCount }
          : item),
      }));
    } catch (error) {
      if (error.response?.status === 404) {
        queryClient.setQueryData(["community", "posts", activeCategory, page, 10], (current) => current && ({
          ...current,
          count: Math.max(0, current.count - 1),
          results: current.results.filter((item) => Number(item.postId) !== postId),
        }));
        toast.error("게시글이 삭제되어 목록에서 제거했어요.");
      } else {
        toast.error(error.response?.data?.detail ?? "좋아요를 변경하지 못했어요. 다시 시도해 주세요.");
      }
    } finally {
      setPendingLikeIds((current) => {
        const next = new Set(current);
        next.delete(postId);
        return next;
      });
    }
  };

  return (
    <MobileLayout>
      <main className="relative min-h-[852px] w-full max-w-[390px] overflow-hidden bg-white text-[#353331]">
        <h1 className="absolute left-6 right-6 top-[96px] text-[28px] font-semibold leading-[1.4] tracking-[-0.84px]">
          {headline.title}
          <br />
          {headline.description}
        </h1>

        <div className="absolute left-6 top-[190px] flex items-center gap-[7px]">
          {categories.map(({ label, value }) => (
            <Chip
              key={value}
              active={activeCategory === value}
              onClick={() => { setActiveCategory(value); setPage(1); }}
            >
              {label}
            </Chip>
          ))}
        </div>
        <button
          type="button"
          aria-label="게시물 작성"
          onClick={() => isLoggedIn ? navigate("/community/write") : (setLoginReturnTo("/community/write"), setIsLoginPromptOpen(true))}
          className="absolute right-[24px] top-[198px] flex h-6 w-6 items-center justify-center"
        >
          <img src={modifyIcon} alt="" aria-hidden="true" />
        </button>

        <section aria-label="커뮤니티 게시물" className="absolute bottom-[278px] left-6 right-6 top-[253px] overflow-y-auto">
          {isLoggedIn && postsQuery.isPending && <p className="flex min-h-full items-center justify-center text-center text-sm text-[#A5A4A3]">게시글을 불러오는 중...</p>}
          {postsQuery.isError && <div className="flex min-h-full flex-col items-center justify-center text-center text-sm text-[#797776]">
            <p role="alert">{postsQuery.error?.response?.data?.detail ?? "게시글을 불러오지 못했어요."}</p>
            <button type="button" onClick={() => postsQuery.refetch()} className="mt-2 text-[#33B8D7]">다시 시도</button>
          </div>}
          {!isLoggedIn && <p className="flex min-h-full items-center justify-center text-center text-sm text-[#A5A4A3]">로그인 후 게시글을 확인할 수 있어요.</p>}
          {!postsQuery.isPending && !postsQuery.isError && isLoggedIn && visiblePosts.length === 0 && (
            <p className="flex min-h-full items-center justify-center text-center text-sm text-[#A5A4A3]">아직 게시글이 없어요.</p>
          )}
          {visiblePosts.map((post, index) => {
            const postId = String(post.postId);
            const postMessage = post.content;
            const liked = Boolean(post.isLiked);
            const likePending = pendingLikeIds.has(Number(postId));
            return (
            <article key={postId} className="relative h-[110px]">
              <div className="absolute left-0 top-0 h-[76px] w-[78px] rounded-[13px] bg-[#E9E8E8]/60">
                <button
                  type="button"
                  disabled={likePending}
                  aria-label={`${liked ? "좋아요 취소" : "좋아요"}: ${postMessage}`}
                  aria-pressed={liked}
                  aria-busy={likePending}
                  onClick={() => toggleLike(post)}
                  className="absolute left-[8px] top-[8px] flex h-[16px] w-[16px] items-center justify-center"
                >
                  {liked ? (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="#60E1FF" aria-hidden="true">
                      <path d="M9.425 0C11.3994 0 13 1.64696 13 3.9527C13 8.56419 8.125 11.1993 6.5 12.1875C4.875 11.1993 0 8.56419 0 3.9527C0 1.64696 1.625 0 3.575 0C4.78398 0 5.85 0.658784 6.5 1.31757C7.15 0.658784 8.216 0 9.425 0Z" />
                    </svg>
                  ) : (
                    <img src={heartIcon} alt="" aria-hidden="true" className="h-[13px] w-[13px]" />
                  )}
                </button>
              </div>
              <p className="absolute left-[99px] right-0 top-[5px] line-clamp-2 text-[16px] font-medium leading-[1.38] tracking-[-0.48px] text-[#4C4A48]">
                {post.imageUrl && <img src={post.imageUrl} alt="" className="mr-2 inline-block h-8 w-8 rounded object-cover align-middle" />}
                {postMessage}
              </p>
              <div className="absolute left-[99px] top-[55px] flex items-center gap-[7px] whitespace-nowrap text-[12px] font-medium leading-[1.5] tracking-[-0.36px] text-[#A5A4A3]">
                <span>{post.createdAtDisplay ?? (post.createdAt ? "방금 전" : "1시간 전")}</span>
                <span aria-hidden="true">ㅣ</span>
                <span>공감 {post.likeCount ?? post.likes ?? 0}</span>
                <span aria-hidden="true">ㅣ</span>
                <span>{post.region?.shortName ?? "지역 정보 없음"}</span>
              </div>
              {index < visiblePosts.length - 1 && (
                <div aria-hidden="true" className="absolute bottom-[17px] left-0 right-0 h-px bg-[#E9E8E8]" />
              )}
            </article>
          );})}
          {isLoggedIn && !postsQuery.isError && pageCount > 1 && (
            <div className="flex items-center justify-center gap-5 py-3 text-sm font-medium text-[#797776]">
              <button type="button" disabled={page <= 1 || postsQuery.isFetching} onClick={() => setPage((current) => current - 1)} className="disabled:opacity-40">이전</button>
              <span>{page} / {pageCount}</span>
              <button type="button" disabled={page >= pageCount || postsQuery.isFetching} onClick={() => setPage((current) => current + 1)} className="disabled:opacity-40">다음</button>
            </div>
          )}
        </section>

        <Card
          as="button"
          type="button"
          onClick={() => isLoggedIn ? navigate(premiumTarget) : (setLoginReturnTo(premiumTarget), setIsLoginPromptOpen(true))}
          aria-label="멋사님 우산 챙기셨나요? Wee 결제 화면 열기"
          className="absolute left-1/2 top-[574px] h-[80px] w-[345px] max-w-[calc(100%-48px)] -translate-x-1/2 !rounded-[20px] !border-0 !p-0 text-left shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]"
        >
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-[rgba(240,227,255,0.2)] to-[rgba(5,196,240,0.2)]" />
          <p className="absolute left-[27px] top-[17px] text-[16px] font-semibold leading-[1.5] tracking-[-0.48px] text-[#62605F]">
            {premiumCard.message}
          </p>
          <p className="absolute left-[27px] top-[44px] text-[12px] font-medium leading-[1.5] tracking-[-0.36px] text-[#8F8E8D]">
            {premiumCard.subMessage}
          </p>
          <img
            src={diamondIcon}
            alt=""
            aria-hidden="true"
            className="absolute right-[24px] top-[29px]"
          />
        </Card>

        <BottomNav />
      </main>
      <LoginRequiredModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        onLogin={() => navigate("/consent", { state: { intent: "kakao", from: loginReturnTo } })}
      />
    </MobileLayout>
  );
}
