import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import { COMMUNITY_TAGS, MAX_CONTENT_LENGTH } from "../../constants/community";
import { useMyPostQuery, useUpdateMyPost } from "../../hooks/useActivity";
import useImagePicker from "../../hooks/useImagePicker";
import useToast from "../../hooks/useToast";

// 에러 응답에서 화면에 보여줄 문장 하나만 꺼내기 (문자열이 아닌 값은 무시)
const pickMessage = (...values) =>
  values.flat().find((value) => typeof value === "string" && value.trim());

// 불러온 게시글(post)로 입력칸을 채워서 보여주는 수정 폼
// (post 가 준비된 뒤에만 렌더링되므로 useState 초기값에 바로 넣을 수 있어요)
const CommunityEditForm = ({ post, postId }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const updatePost = useUpdateMyPost();
  const picker = useImagePicker();
  const [selectedTag, setSelectedTag] = useState(post.tag);
  const [message, setMessage] = useState(post.message ?? "");
  const [formError, setFormError] = useState("");

  const detailPath = `/mypage/activity/${postId}`;
  const trimmedMessage = message.trim();
  const contentChanged = trimmedMessage !== (post.message ?? "").trim();
  const tagChanged = selectedTag !== post.tag;
  const hasChanges = contentChanged || tagChanged || Boolean(picker.photo);
  const canSubmit =
    Boolean(trimmedMessage) &&
    Boolean(selectedTag) &&
    hasChanges &&
    !picker.isProcessing &&
    !updatePost.isPending;

  const submit = () => {
    if (!canSubmit) return;
    setFormError("");

    // 바뀐 항목만 보내요 (PATCH)
    const payload = { postId };
    if (contentChanged) payload.content = trimmedMessage;
    if (tagChanged) payload.tag = selectedTag;
    if (picker.photo) payload.image = picker.photo;

    updatePost.mutate(payload, {
      onSuccess: () => {
        toast.success("게시글을 수정했어요.");
        navigate(detailPath, { replace: true });
      },
      onError: (error) => {
        // 내 글이 아니거나 이미 삭제된 글 -> 404
        if (error.response?.status === 404) {
          toast.error("게시글을 찾을 수 없어요.");
          navigate("/mypage/activity?type=written", { replace: true });
          return;
        }
        const data = error.response?.data;
        setFormError(
          pickMessage(data?.content, data?.tag, data?.image, data?.detail) ??
            "게시글을 수정하지 못했어요. 다시 시도해 주세요.",
        );
      },
    });
  };

  const previewSrc = picker.preview || post.image;

  return (
    <main className="relative mx-auto min-h-[852px] w-full max-w-[390px] overflow-hidden bg-white text-[#353331]">
      <div className="absolute left-[23px] right-[23px] top-[74px]">
        <Header
          left="취소"
          right={updatePost.isPending ? "수정 중..." : "수정"}
          onLeft={() => navigate(detailPath)}
          onRight={submit}
          rightDisabled={!canSubmit}
        />
      </div>

      <section
        className="absolute left-[24px] right-[24px] top-[136px]"
        aria-labelledby="edit-tags-title"
      >
        <h1
          id="edit-tags-title"
          className="text-[20px] font-semibold leading-[1.38] tracking-[-0.6px]"
        >
          태그
        </h1>
        <div className="mt-[18px] flex gap-[8px]">
          {COMMUNITY_TAGS.map((tag) => {
            const active = selectedTag === tag.value;
            return (
              <button
                key={tag.value}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedTag(tag.value)}
                className={`flex h-[36px] items-center gap-[5px] rounded-full border px-[12px] text-[14px] font-semibold leading-[1.5] tracking-[-0.42px] ${active ? "border-[#60E1FF] bg-[#60E1FF] text-white" : "border-[#D2D2D1] bg-white text-[#A5A4A3]"}`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </section>

      <section
        className="absolute left-[24px] right-[24px] top-[248px]"
        aria-labelledby="edit-message-title"
      >
        <h2
          id="edit-message-title"
          className="text-[20px] font-semibold leading-[1.38] tracking-[-0.6px]"
        >
          한마디
        </h2>
        <div className="relative mt-[17px] h-[181px] rounded-[15px] bg-[#E9E8E8]/60">
          <textarea
            maxLength={MAX_CONTENT_LENGTH}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="오늘 뭘 입었는지, 뭘 챙겼는지 적어주세요"
            aria-label="커뮤니티에 남길 한마디"
            className="h-full w-full resize-none rounded-[15px] bg-transparent px-[21px] py-[15px] text-[16px] font-medium leading-[1.5] tracking-[-0.48px] text-[#353331] outline-none placeholder:text-[#A5A4A3]"
          />
        </div>
        <div className="mt-[9px] flex items-start justify-between gap-2 text-[14px] font-medium leading-[1.5] tracking-[-0.42px] text-[#A5A4A3]">
          <p>작성 당시 저장된 동네는 수정할 수 없어요.</p>
          <span className="shrink-0">
            {message.length} / {MAX_CONTENT_LENGTH}
          </span>
        </div>
      </section>

      <section
        className="absolute left-[24px] top-[553px]"
        aria-labelledby="edit-photo-title"
      >
        <h2
          id="edit-photo-title"
          className="text-[20px] font-semibold leading-[1.38] tracking-[-0.6px]"
        >
          사진
        </h2>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          className="sr-only"
          onChange={(event) => {
            picker.choose(event.target.files?.[0]);
            event.target.value = ""; // 같은 파일을 다시 골라도 change 가 발생하도록 초기화
          }}
        />
        <button
          type="button"
          aria-label={
            picker.photo
              ? `사진 선택됨: ${picker.photo.name}. 사진 변경`
              : "사진 변경"
          }
          onClick={() => fileInputRef.current?.click()}
          className="mt-[17px] flex h-[76px] w-[78px] items-center justify-center overflow-hidden rounded-[15px] bg-[#E9E8E8]/60 text-[#A5A4A3]"
        >
          {previewSrc ? (
            <img
              src={previewSrc}
              alt="게시글 사진 미리보기"
              className="h-full w-full object-cover"
            />
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path d="M4 5.5h10v2H6v10h12v-5h2v7H4v-14Z" fill="currentColor" />
              <path
                d="m7 16 3.2-3.4 2.2 2.2 3.3-4 4.3 5.2H7Z"
                fill="currentColor"
              />
              <path
                d="M18 3v5m-2.5-2.5h5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </section>

      {(formError || picker.error) && (
        <p
          role="alert"
          className="absolute left-6 right-6 top-[710px] text-center text-sm font-medium text-red-500"
        >
          {formError || picker.error}
        </p>
      )}

      <BottomNav />
    </main>
  );
};

// 수정 페이지: /community/edit/:postId
// 내 게시글 1건을 먼저 불러오고(GET /api/community/posts/{postId}/), 준비되면 수정 폼을 보여줘요
export default function CommunityEditPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const postQuery = useMyPostQuery(postId);
  const post = postQuery.data;

  return (
    <MobileLayout>
      {post ? (
        <CommunityEditForm key={postId} post={post} postId={postId} />
      ) : (
        <main className="relative mx-auto min-h-[852px] w-full max-w-[390px] bg-white px-[26px] pt-[73px] text-[#353331]">
          <Header
            back
            onLeft={() => navigate("/mypage/activity?type=written")}
          />
          <p className="mt-8 text-center text-sm text-[#A5A4A3]">
            {postQuery.isError
              ? "게시글을 찾을 수 없어요."
              : "게시글을 불러오는 중이에요."}
          </p>
        </main>
      )}
    </MobileLayout>
  );
}
