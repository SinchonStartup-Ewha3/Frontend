import heartIcon from "../assets/icons/heart.svg";
import { timeAgo } from "../utils/format";

// 게시물 목록 한 줄 (마이페이지 > 내 활동). 홈 커뮤니티 목록과 같은 모양이라 나중에 같이 써도 돼요.
//  - heartActive: 하트가 채워진 상태 / heartColor: 채움 색 (저장한 게시물은 하늘색, 커뮤니티 공감은 #FF5574)
//  - onHeartClick 이 없으면 하트는 그냥 장식(작성한 게시물)
const HEART_PATH =
  "M9.425 0C11.3994 0 13 1.64696 13 3.9527C13 8.56419 8.125 11.1993 6.5 12.1875C4.875 11.1993 0 8.56419 0 3.9527C0 1.64696 1.625 0 3.575 0C4.78398 0 5.85 0.658784 6.5 1.31757C7.15 0.658784 8.216 0 9.425 0Z";

const PostListItem = ({ post, heartActive = false, heartColor = "#60E1FF", onHeartClick, onClick, showDivider = true }) => {
  const Heart = heartActive ? (
    <svg width="13" height="13" viewBox="0 0 13 13" fill={heartColor} aria-hidden="true">
      <path d={HEART_PATH} />
    </svg>
  ) : (
    <img src={heartIcon} alt="" aria-hidden="true" className="h-[13px] w-[13px]" />
  );

  return (
    <article className="relative h-[108px]">
      {/* 썸네일(이미지 없으면 회색 박스) + 하트 */}
      <div className="absolute left-0 top-0 h-[76px] w-[78px] overflow-hidden rounded-[13px] bg-[#E9E8E8]/60">
        {post.image && <img src={post.image} alt="" className="h-full w-full object-cover" />}
        {onHeartClick ? (
          <button
            type="button"
            aria-label={heartActive ? "공감 취소" : "공감"}
            aria-pressed={heartActive}
            onClick={onHeartClick}
            className="absolute left-2 top-2 flex h-4 w-4 items-center justify-center"
          >
            {Heart}
          </button>
        ) : (
          <span className="absolute left-2 top-2 flex h-4 w-4 items-center justify-center">{Heart}</span>
        )}
      </div>

      {/* 본문(최대 2줄) + 메타(시간 | 공감 | 지역) — 누르면 상세 이동 */}
      <button type="button" onClick={onClick} disabled={!onClick} className="absolute inset-0 text-left">
        <p className="absolute left-[99px] right-0 top-[10px] line-clamp-2 text-base font-medium leading-[22px] tracking-[-0.03em] text-[#4C4A48]">
          {post.message}
        </p>
        <div className="absolute left-[99px] top-[57px] flex items-center gap-[7px] whitespace-nowrap text-xs font-medium leading-[18px] tracking-[-0.03em] text-[#A5A4A3]">
          <span>{post.createdAtDisplay ?? timeAgo(post.createdAt)}</span>
          <span aria-hidden="true">ㅣ</span>
          <span>공감 {post.likes ?? 0}</span>
          {(post.region?.shortName || typeof post.region === "string") && (
            <>
              <span aria-hidden="true">ㅣ</span>
              <span className="max-w-[95px] truncate">
                {post.region?.shortName ?? post.region}
              </span>
            </>
          )}
        </div>
      </button>

      {showDivider && <div aria-hidden="true" className="absolute inset-x-0 bottom-4 h-px bg-[#E9E8E8]" />}
    </article>
  );
};

export default PostListItem;
