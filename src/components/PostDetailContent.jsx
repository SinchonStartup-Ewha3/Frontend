import { COMMUNITY_TAGS } from "../constants/community";
import { timeAgo } from "../utils/format";

// 커뮤니티와 작성한 게시물 상세에서 같은 본문/사진/메타 배치를 사용해요.
export default function PostDetailContent({ post, children }) {
  const image = post.imageUrl ?? post.image;
  const tagLabel = post.tagLabel ?? COMMUNITY_TAGS.find((tag) => tag.value === post.tag)?.label;
  const region = typeof post.region === "string" ? post.region : post.region?.shortName;

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
