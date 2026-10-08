import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import Card from "../../components/Card";
import Chip from "../../components/Chip";
import MobileLayout from "../../components/MobileLayout";
import heartIcon from "../../assets/icons/heart.svg";
import modifyIcon from "../../assets/icons/modify.svg";
import diamondIcon from "../../assets/icons/diamond.svg";

const categories = ["가디건", "패딩", "코트"];

const posts = [
  { id: "sample-1", likes: 20 },
  { id: "sample-2", likes: 0 },
  { id: "sample-3", likes: 0 },
];

export default function CommunityPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("가디건");
  const [lastPost] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("community:last-post") || "null");
    } catch {
      return null;
    }
  });
  const [likedPostIds, setLikedPostIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("community:liked-posts") || "[]"));
    } catch {
      return new Set();
    }
  });
  const visiblePosts = lastPost ? [lastPost, ...posts] : posts;

  useEffect(() => {
    localStorage.setItem("community:liked-posts", JSON.stringify([...likedPostIds]));
  }, [likedPostIds]);

  const toggleLike = (post) => {
    const postId = String(post.createdAt ?? post.id);
    setLikedPostIds((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  return (
    <MobileLayout>
      <main className="relative min-h-[852px] w-full max-w-[390px] overflow-hidden bg-white text-[#353331]">
        <h1 className="absolute left-6 right-6 top-[96px] text-[28px] font-semibold leading-[1.4] tracking-[-0.84px]">
          뚝 떨어진 기온에
          <br />
          얇은 아우터와 우산을 추천해요
        </h1>

        <div className="absolute left-6 top-[190px] flex items-center gap-[7px]">
          {categories.map((label) => (
            <Chip
              key={label}
              active={activeCategory === label}
              onClick={() => setActiveCategory(label)}
            >
              {label}
            </Chip>
          ))}
        </div>
        <button
          type="button"
          aria-label="게시물 작성"
          onClick={() => navigate("/community/write")}
          className="absolute right-[24px] top-[198px] flex h-6 w-6 items-center justify-center"
        >
          <img src={modifyIcon} alt="" aria-hidden="true" />
        </button>

        <section aria-label="커뮤니티 게시물" className="absolute left-6 right-6 top-[253px]">
          {visiblePosts.map((post, index) => (
            <article key={index} className="relative h-[110px]">
              <div className="absolute left-0 top-0 h-[76px] w-[78px] rounded-[13px] bg-[#E9E8E8]/60">
                <button
                  type="button"
                  aria-label={`${likedPostIds.has(String(post.createdAt ?? post.id)) ? "좋아요 취소" : "좋아요"}: ${post.message ?? "가디건만 입고 나왔다가 후회했어요"}`}
                  aria-pressed={likedPostIds.has(String(post.createdAt ?? post.id))}
                  onClick={() => toggleLike(post)}
                  className="absolute left-[8px] top-[8px] flex h-[16px] w-[16px] items-center justify-center"
                >
                  {likedPostIds.has(String(post.createdAt ?? post.id)) ? (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="#FF5574" aria-hidden="true">
                      <path d="M9.425 0C11.3994 0 13 1.64696 13 3.9527C13 8.56419 8.125 11.1993 6.5 12.1875C4.875 11.1993 0 8.56419 0 3.9527C0 1.64696 1.625 0 3.575 0C4.78398 0 5.85 0.658784 6.5 1.31757C7.15 0.658784 8.216 0 9.425 0Z" />
                    </svg>
                  ) : (
                    <img src={heartIcon} alt="" aria-hidden="true" className="h-[13px] w-[13px]" />
                  )}
                </button>
              </div>
              <p className="absolute left-[99px] right-0 top-[5px] line-clamp-2 text-[16px] font-medium leading-[1.38] tracking-[-0.48px] text-[#4C4A48]">
                {post.message ?? "가디건만 입고 나왔다가 후회했어요 지금 나가시는 분들은 바람막이 챙겨"}
              </p>
              <div className="absolute left-[99px] top-[55px] flex items-center gap-[7px] whitespace-nowrap text-[12px] font-medium leading-[1.5] tracking-[-0.36px] text-[#A5A4A3]">
                <span>{post.createdAt ? "방금 전" : "1시간 전"}</span>
                <span aria-hidden="true">ㅣ</span>
                <span>공감 {(post.likes ?? 0) + (likedPostIds.has(String(post.createdAt ?? post.id)) ? 1 : 0)}</span>
                <span aria-hidden="true">ㅣ</span>
                <span>{post.tags?.length ? post.tags.join(", ") : "서울 서대문구"}</span>
              </div>
              {index < posts.length - 1 && (
                <div aria-hidden="true" className="absolute bottom-[17px] left-0 right-0 h-px bg-[#E9E8E8]" />
              )}
            </article>
          ))}
        </section>

        <Card className="absolute left-1/2 top-[574px] h-[80px] w-[345px] -translate-x-1/2 !rounded-[20px] !border-0 !p-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]">
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-[rgba(240,227,255,0.2)] to-[rgba(5,196,240,0.2)]" />
          <p className="absolute left-[27px] top-[17px] text-[16px] font-semibold leading-[1.5] tracking-[-0.48px] text-[#62605F]">
            멋사님 우산 챙기셨나요?
          </p>
          <p className="absolute left-[27px] top-[44px] text-[12px] font-medium leading-[1.5] tracking-[-0.36px] text-[#8F8E8D]">
            이미 많은 사람들이 알림 기능을 사용하고 있어요
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
    </MobileLayout>
  );
}
