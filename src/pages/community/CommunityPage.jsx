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
import {
  fetchCommunityPosts,
  fetchCommunityWeatherCopy,
  toggleCommunityPostLike,
} from "../../api/community";
import useToast from "../../hooks/useToast";
import { useIsPremium } from "../../hooks/usePayment";
import queryKeys from "../../api/queryKeys";
import useLocationStore from "../../store/useLocationStore";
import weeLogo from "../../assets/icons/logo.svg";
import { COMMUNITY_TAGS } from "../../constants/community";

const categories = [
  { label: "전체", value: "all" },
  ...COMMUNITY_TAGS,
];

const PAGE_SIZE = 10;
// 위치 문제로 날씨 문구를 못 받은 경우의 에러 코드 (비로그인이면 지역을 다시 고르게 안내)
const LOCATION_ERROR_CODES = [
  "INVALID_REGION",
  "INVALID_LOCATION",
  "OUT_OF_SERVICE_AREA",
];

export default function CommunityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isLoggedIn = Boolean(localStorage.getItem("wee_access_token"));
  // 프리미엄 구독자는 구독 유도 카드를 숨겨요 (누르면 /premium → 설문으로 넘어가던 문제)
  const { isPremium, isLoading: isPremiumLoading } = useIsPremium({
    enabled: isLoggedIn,
  });
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [loginReturnTo, setLoginReturnTo] = useState("/community");
  const [pendingLikeIds, setPendingLikeIds] = useState(() => new Set());
  const toast = useToast();
  // 비로그인 사용자가 홈/위치 설정 화면에서 고른 위치 (지역코드 또는 좌표)
  const selectedRegion = useLocationStore((state) => state.selected);
  const guestCoordinates = useLocationStore((state) => state.coordinates);
  const guestRegionCode =
    selectedRegion && typeof selectedRegion === "object"
      ? selectedRegion.regionCode
      : undefined;
  const guestLat = guestCoordinates?.lat;
  const guestLng = guestCoordinates?.lng;
  const hasGuestLocation =
    Boolean(guestRegionCode) || (guestLat != null && guestLng != null);

  const postsQueryKey = queryKeys.communityPostsPage(
    activeCategory,
    page,
    PAGE_SIZE,
  );
  const postsQuery = useQuery({
    queryKey: postsQueryKey,
    queryFn: () =>
      fetchCommunityPosts({
        tag: activeCategory === "all" ? undefined : activeCategory,
        page,
        pageSize: PAGE_SIZE,
      }),
    retry: false,
    refetchOnMount: "always",
  });
  // 날씨 문구: 로그인은 토큰만 보내면 서버가 저장 지역을 사용 / 비로그인은 위치(regionCode 또는 lat,lng) 필수
  const weatherCopyScope = isLoggedIn
    ? "me"
    : (guestRegionCode ??
      (hasGuestLocation ? `${guestLat},${guestLng}` : "unselected"));
  const weatherCopyQuery = useQuery({
    queryKey: queryKeys.communityWeatherCopy(weatherCopyScope),
    queryFn: () =>
      fetchCommunityWeatherCopy(
        isLoggedIn
          ? {}
          : { regionCode: guestRegionCode, lat: guestLat, lng: guestLng },
      ),
    enabled: isLoggedIn || hasGuestLocation,
    retry: false,
  });
  const weatherCopy = weatherCopyQuery.data;
  const headline = weatherCopy?.headline;
  const premiumCard = weatherCopy?.premiumCard;
  // 로그인 안 함: 항상 노출 / 구독자: 숨김 / 구독 상태 확인 중: 깜빡임 방지로 숨김
  const showPremiumCard =
    !isLoggedIn || Boolean(premiumCard && !isPremiumLoading && !isPremium);
  const visiblePosts = postsQuery.data?.results ?? [];
  const pageCount = Math.max(
    1,
    Math.ceil((postsQuery.data?.count ?? 0) / PAGE_SIZE),
  );

  useEffect(() => {
    if (
      weatherCopyQuery.error?.response?.data?.code ===
      "COMMUNITY_LOCATION_REQUIRED"
    ) {
      navigate("/location-setup", {
        replace: true,
        state: { from: "/community" },
      });
    }
  }, [navigate, weatherCopyQuery.error]);

  // 지역 선택 화면으로 이동 (선택이 끝나면 다시 커뮤니티로 돌아와요)
  const goToLocationSetup = () =>
    navigate("/location-setup", { state: { from: "/community" } });
  const weatherCopyErrorCode = weatherCopyQuery.error?.response?.data?.code;

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
      queryClient.setQueryData(
        postsQueryKey,
        (current) =>
          current && {
            ...current,
            results: current.results.map((item) =>
              Number(item.postId) === postId
                ? {
                    ...item,
                    isLiked: result.isLiked,
                    likeCount: result.likeCount,
                  }
                : item,
            ),
          },
      );
      // 좋아요/취소 후 저장한 게시물 목록 캐시도 갱신 (다음에 열 때 최신 상태)
      queryClient.invalidateQueries({ queryKey: queryKeys.likedPosts });
    } catch (error) {
      if (error.response?.status === 404) {
        queryClient.setQueryData(
          postsQueryKey,
          (current) =>
            current && {
              ...current,
              count: Math.max(0, current.count - 1),
              results: current.results.filter(
                (item) => Number(item.postId) !== postId,
              ),
            },
        );
        toast.error("게시글이 삭제되어 목록에서 제거했어요.");
      } else {
        toast.error(
          error.response?.data?.detail ??
            "좋아요를 변경하지 못했어요. 다시 시도해 주세요.",
        );
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
      <main className="relative mx-auto flex min-h-[852px] w-full max-w-[390px] flex-col bg-white pb-0 text-[#353331]">
        <img
          src={weeLogo}
          alt="WEE"
          className="absolute left-6 top-[28px] h-[24px] w-auto"
          style={{
            filter:
              "brightness(0) saturate(100%) invert(80%) sepia(28%) saturate(1492%) hue-rotate(154deg) brightness(101%) contrast(101%)",
          }}
        />
        <header className="mx-6 pt-[96px]">
          {headline && (
            <h1 className="break-words text-[28px] font-semibold leading-[1.4] tracking-[-0.84px]">
              {headline.title}
              <br />
              {headline.description}
            </h1>
          )}
          {weatherCopyQuery.isLoading && (
            <p className="text-sm text-[#A5A4A3]">날씨 문구를 불러오는 중...</p>
          )}
          {weatherCopyQuery.isError && (
            <div className="text-sm text-[#797776]">
              <p role="alert">
                {weatherCopyQuery.error?.response?.data?.detail ??
                  "날씨 문구를 불러오지 못했어요."}
              </p>
              {!isLoggedIn &&
              LOCATION_ERROR_CODES.includes(weatherCopyErrorCode) ? (
                <button
                  type="button"
                  onClick={goToLocationSetup}
                  className="mt-1 text-[#33B8D7]"
                >
                  지역 다시 선택
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => weatherCopyQuery.refetch()}
                  className="mt-1 text-[#33B8D7]"
                >
                  다시 시도
                </button>
              )}
            </div>
          )}
          {!isLoggedIn && !hasGuestLocation && (
            <div className="text-sm text-[#797776]">
              <p>지역을 선택하면 오늘의 날씨 문구를 확인할 수 있어요.</p>
              <button
                type="button"
                onClick={goToLocationSetup}
                className="mt-1 text-[#33B8D7]"
              >
                지역 선택하기
              </button>
            </div>
          )}
          <div className="mt-4 flex items-center gap-[7px]">
            {categories.map(({ label, value }) => (
              <Chip
                key={value}
                active={activeCategory === value}
                className="shrink-0 !px-[10px]"
                onClick={() => {
                  setActiveCategory(value);
                  setPage(1);
                }}
              >
                {label}
              </Chip>
            ))}
            <button
              type="button"
              aria-label="게시물 작성"
              onClick={() =>
                isLoggedIn
                  ? navigate("/community/write")
                  : (setLoginReturnTo("/community/write"),
                    setIsLoginPromptOpen(true))
              }
              className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center"
            >
              <img src={modifyIcon} alt="" aria-hidden="true" />
            </button>
          </div>
        </header>

        <section
          aria-label="커뮤니티 게시물"
          className="mx-6 mt-[27px] h-[321px] shrink-0 overflow-y-auto"
        >
          {postsQuery.isPending && (
            <p className="flex min-h-full items-center justify-center text-center text-sm text-[#A5A4A3]">
              게시글을 불러오는 중...
            </p>
          )}
          {postsQuery.isError && (
            <div className="flex min-h-full flex-col items-center justify-center text-center text-sm text-[#797776]">
              <p role="alert">
                {postsQuery.error?.response?.data?.detail ??
                  "게시글을 불러오지 못했어요."}
              </p>
              <button
                type="button"
                onClick={() => postsQuery.refetch()}
                className="mt-2 text-[#33B8D7]"
              >
                다시 시도
              </button>
            </div>
          )}
          {!postsQuery.isPending &&
            !postsQuery.isError &&
            visiblePosts.length === 0 && (
              <p className="flex min-h-full items-center justify-center text-center text-sm text-[#A5A4A3]">
                아직 게시글이 없어요.
              </p>
            )}
          {visiblePosts.map((post, index) => {
            const postId = String(post.postId);
            const postMessage = post.content;
            const liked = Boolean(post.isLiked);
            const likePending = pendingLikeIds.has(Number(postId));
            return (
              <article key={postId} className="relative h-[110px]">
                <div className="absolute left-0 top-0 h-[76px] w-[78px] overflow-hidden rounded-[13px] bg-[#E9E8E8]/60">
                  {(post.imageUrl ?? post.image) && (
                    <img
                      src={post.imageUrl ?? post.image}
                      alt="게시물 사진"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
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
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="#60E1FF"
                        aria-hidden="true"
                      >
                        <path d="M9.425 0C11.3994 0 13 1.64696 13 3.9527C13 8.56419 8.125 11.1993 6.5 12.1875C4.875 11.1993 0 8.56419 0 3.9527C0 1.64696 1.625 0 3.575 0C4.78398 0 5.85 0.658784 6.5 1.31757C7.15 0.658784 8.216 0 9.425 0Z" />
                      </svg>
                    ) : (
                      <img
                        src={heartIcon}
                        alt=""
                        aria-hidden="true"
                        className="h-[13px] w-[13px]"
                      />
                    )}
                  </button>
                </div>
                <p className="absolute left-[99px] right-0 top-[5px] line-clamp-2 text-[16px] font-medium leading-[1.38] tracking-[-0.48px] text-[#4C4A48]">
                  {postMessage}
                </p>
                <div className="absolute left-[99px] top-[55px] flex items-center gap-[7px] whitespace-nowrap text-[12px] font-medium leading-[1.5] tracking-[-0.36px] text-[#A5A4A3]">
                  <span>
                    {post.createdAtDisplay ??
                      (post.createdAt ? "방금 전" : "1시간 전")}
                  </span>
                  <span aria-hidden="true">ㅣ</span>
                  <span>공감 {post.likeCount ?? post.likes ?? 0}</span>
                  <span aria-hidden="true">ㅣ</span>
                  <span>{post.region?.shortName ?? "지역 정보 없음"}</span>
                </div>
                {index < visiblePosts.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute bottom-[17px] left-0 right-0 h-px bg-[#E9E8E8]"
                  />
                )}
              </article>
            );
          })}
          {!postsQuery.isError && pageCount > 1 && (
            <div className="flex items-center justify-center gap-5 py-3 text-sm font-medium text-[#797776]">
              <button
                type="button"
                disabled={page <= 1 || postsQuery.isFetching}
                onClick={() => setPage((current) => current - 1)}
                className="disabled:opacity-40"
              >
                이전
              </button>
              <span>
                {page} / {pageCount}
              </span>
              <button
                type="button"
                disabled={page >= pageCount || postsQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
                className="disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}
        </section>

        {showPremiumCard && (
          <Card
            as="button"
            type="button"
            onClick={() => {
              const targetUrl = premiumCard?.targetUrl ?? "/premium";
              navigate(
                typeof targetUrl === "string" &&
                  targetUrl.startsWith("/") &&
                  !targetUrl.startsWith("//")
                  ? targetUrl
                  : "/premium",
              );
            }}
            aria-label={`${premiumCard?.message ?? "맞춤형 행동 알림"} 프리미엄 기능 보기`}
            className="relative mx-auto flex h-[80px] w-[345px] max-w-[calc(100%-48px)] shrink-0 items-center justify-between gap-3 !rounded-[20px] !border-0 !px-[27px] !py-4 text-left shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]"
          >
            <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-[rgba(240,227,255,0.2)] to-[rgba(5,196,240,0.2)]" />
            <div className="relative z-[1] min-w-0 flex-1">
              <p className="break-words text-[16px] font-semibold leading-[1.5] tracking-[-0.48px] text-[#62605F]">
                {premiumCard?.message ?? "맞춤형 행동 알림"}
              </p>
              <p className="mt-1 break-words text-[12px] font-medium leading-[1.5] tracking-[-0.36px] text-[#8F8E8D]">
                {premiumCard?.subMessage ??
                  "날씨에 맞는 알림으로 외출을 준비해보세요"}
              </p>
            </div>
            <img
              src={diamondIcon}
              alt=""
              aria-hidden="true"
              className="relative z-[1] shrink-0"
            />
          </Card>
        )}

        <Card
          aria-label="광고 영역"
          className="relative mx-auto mt-[14px] h-[80px] w-[345px] max-w-[calc(100%-48px)] shrink-0 !border-[#F3F3F3] !p-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[13px] bg-gradient-to-r from-[rgba(240,227,255,0.2)] to-[rgba(5,196,240,0.2)]"
          />
          <p className="absolute left-[27px] top-1/2 -translate-y-1/2 text-[16px] font-semibold leading-[1.5] tracking-[-0.48px] text-[#62605F]">
            광고 칸
          </p>
        </Card>

        <BottomNav bottomClassName="bottom-[15px]" />
      </main>
      <LoginRequiredModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        onLogin={() =>
          navigate("/login", {
            state: { from: loginReturnTo },
          })
        }
      />
    </MobileLayout>
  );
}
