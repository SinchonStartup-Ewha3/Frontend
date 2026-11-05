import { COMMUNITY_TAGS } from "../constants/community";
import { timeAgo } from "../utils/format";

// 커뮤니티와 작성한 게시물 상세에서 같은 본문/사진/메타 배치를 사용해요.
export default function PostDetailContent({ post, children, layout = "default" }) {
  const image = post.imageUrl !== undefined ? post.imageUrl : post.image;
  const tagLabel = post.tagLabel ?? COMMUNITY_TAGS.find((tag) => tag.value === post.tag)?.label;
  const region = typeof post.region === "string" ? post.region : post.region?.shortName;

  if (layout === "community") {
    return (
      <article className="mt-5">
        <div className="flex h-[180px] w-full items-center justify-center overflow-hidden rounded-[16px] bg-[#F3F3F3]">
          {image ? (
            <img src={image} alt="게시글 첨부 사진" className="h-full w-full object-cover" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BDBDBC" strokeWidth="1.5" aria-hidden="true">
              <path d="M13 5H4v15h16v-9M16 5h6m-3-3v6M4 17l5-5 4 4 3-3 4 4" />
              <circle cx="9" cy="9" r="1" />
            </svg>
          )}
        </div>
        <div className="mt-5 flex min-h-9 flex-wrap items-center gap-x-3 gap-y-1 text-[14px] font-medium leading-[21px] tracking-[-0.42px] text-[#62605F]">
          {tagLabel && (
            <span className="flex h-9 shrink-0 items-center rounded-full bg-main px-4 font-semibold text-white">
              {tagLabel}
            </span>
          )}
          <div className="flex min-w-0 flex-wrap items-center gap-x-[7px]">
            <span>{post.createdAtDisplay ?? (post.createdAt ? timeAgo(post.createdAt) : "")}</span>
            <span aria-hidden="true" className="text-[#A5A4A3]">ㅣ</span>
            {children ?? (
              <span className="inline-flex items-center gap-[7px]" aria-label={`공감 ${post.likeCount ?? post.likes ?? post.scraps ?? 0}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={post.isLiked ? "#60E1FF" : "none"} stroke="#60E1FF" strokeWidth="2" aria-hidden="true">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
                {post.likeCount ?? post.likes ?? post.scraps ?? 0}
              </span>
            )}
            {region && <><span aria-hidden="true" className="text-[#A5A4A3]">ㅣ</span><span>{region}</span></>}
          </div>
        </div>
        <p className="mt-6 whitespace-pre-wrap break-words text-[18px] font-medium leading-[27px] tracking-[-0.54px] text-[#62605F]">
          {post.content ?? post.message}
        </p>
      </article>
    );
  }

  return (
    <article className="mt-[22px]">
      {(tagLabel || region) && (
        <p className="mb-4 text-[13px] leading-[18px] text-[#8F8E8D]">
          {[tagLabel, region].filter(Boolean).join(" · ")}
        </p>
      )}
      <p className="whitespace-pre-wrap break-words text-[16px] leading-[1.55] tracking-[-0.32px] text-[#62605F]">
        {post.content ?? post.message}
      </p>
      {image && (
        <img src={image} alt="게시글 첨부 사진" className="mt-[22px] h-auto w-full rounded-[13px]" />
      )}
      <div className="mt-[22px] flex items-center justify-between gap-3 border-t border-[#E9E8E8] pt-[18px]">
        <span className="text-[13px] text-[#A5A4A3]">
          {post.createdAtDisplay ?? (post.createdAt ? timeAgo(post.createdAt) : "")}
        </span>
        {children ?? (
          <span className="flex min-h-11 items-center rounded-full border border-[#E9E8E8] px-4 text-[14px]">
            공감 {post.likeCount ?? post.likes ?? post.scraps ?? 0}
          </span>
        )}
      </div>
    </article>
  );
}
