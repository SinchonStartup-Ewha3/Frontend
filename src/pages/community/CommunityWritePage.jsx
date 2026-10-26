import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import { useQueryClient } from "@tanstack/react-query";
import { createCommunityPost } from "../../api/community";
import queryKeys from "../../api/queryKeys";
import { COMMUNITY_TAGS, MAX_CONTENT_LENGTH } from "../../constants/community";
import useImagePicker from "../../hooks/useImagePicker";
import useToast from "../../hooks/useToast";

const getCurrentCoordinates = () =>
  new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("이 브라우저에서는 위치를 확인할 수 없어요."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      (error) =>
        reject(
          new Error(
            error.code === 1
              ? "게시글에 동네를 표시하려면 위치 권한이 필요해요. 브라우저 설정에서 위치를 허용해 주세요."
              : error.code === 3
                ? "위치 확인 시간이 초과됐어요. 다시 등록해 주세요."
                : "현재 위치를 확인할 수 없어요. 위치 설정을 확인해 주세요.",
          ),
        ),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  });

export default function CommunityWritePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedTag, setSelectedTag] = useState("cardigan");
  const [message, setMessage] = useState("");
  const picker = useImagePicker();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const close = () => navigate("/community");
  const submit = async () => {
    if (isSubmitting) return;
    setFormError("");
    if (!selectedTag) {
      setFormError("태그를 선택해주세요.");
      return;
    }
    if (!message.trim()) {
      setFormError("게시글 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 위치 권한이 있으면 현재 위치(CURRENT), 없거나 실패하면 계정에 저장된 지역(SAVED)으로 등록
      let location = null;
      let usedSavedRegion = false;
      try {
        location = await getCurrentCoordinates();
      } catch {
        usedSavedRegion = true;
      }
      const post = await createCommunityPost({
        content: message,
        tag: selectedTag,
        image: picker.photo,
        location,
      });
      // 피드 / 내 게시물 목록이 새 글을 바로 보여주도록 캐시 새로고침
      queryClient.invalidateQueries({ queryKey: queryKeys.communityPosts });
      queryClient.invalidateQueries({ queryKey: queryKeys.myPosts });
      if (usedSavedRegion)
        toast.show("현재 위치를 확인하지 못해 저장된 동네로 등록했어요.");
      navigate("/community", { state: { createdPost: post } });
    } catch (error) {
      const data = error.response?.data;
      const locationError = data?.location;
      const regionError = data?.region;
      setFormError(
        data?.content?.[0] ??
          data?.tag?.[0] ??
          data?.image?.[0] ??
          (Array.isArray(locationError) ? locationError[0] : locationError) ??
          (Array.isArray(regionError) ? regionError[0] : regionError) ??
          data?.detail ??
          error.message ??
          "게시글을 등록하지 못했어요. 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[390px] overflow-hidden bg-white text-[#353331]">
        <div className="absolute left-[23px] right-[23px] top-[74px]">
          <Header
            left="취소"
            right={isSubmitting ? "등록 중..." : "등록"}
            onLeft={close}
            onRight={submit}
            rightDisabled={isSubmitting || !message.trim() || !selectedTag}
          />
        </div>

        <section
          className="absolute left-[24px] right-[24px] top-[136px]"
          aria-labelledby="outfit-tags-title"
        >
          <h1
            id="outfit-tags-title"
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
                  onClick={() =>
                    setSelectedTag((current) =>
                      current === tag.value ? "" : tag.value,
                    )
                  }
                  className={`flex h-[36px] items-center gap-[5px] rounded-full border px-[12px] text-[14px] font-semibold leading-[1.5] tracking-[-0.42px] ${active ? "border-[#60E1FF] bg-[#60E1FF] text-white" : "border-[#D2D2D1] bg-white text-[#A5A4A3]"}`}
                >
                  {tag.label}
                  <span aria-hidden="true" className="text-[15px] font-normal">
                    ×
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section
          className="absolute left-[24px] right-[24px] top-[248px]"
          aria-labelledby="community-message-title"
        >
          <h2
            id="community-message-title"
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
            <p>
              작성한 후기는 AI 요약과 오늘의 체감 정보에 반영돼요.
              <br />
              등록 시 위치 권한을 요청하며 동네 단위로 표시돼요.
            </p>
            <span className="shrink-0">
              {message.length} / {MAX_CONTENT_LENGTH}
            </span>
          </div>
        </section>

        <section
          className="absolute left-[24px] top-[553px]"
          aria-labelledby="community-photo-title"
        >
          <h2
            id="community-photo-title"
            className="text-[20px] font-semibold leading-[1.38] tracking-[-0.6px]"
          >
            사진
          </h2>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
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
                : "사진 추가"
            }
            onClick={() => fileInputRef.current?.click()}
            className="mt-[17px] flex h-[76px] w-[78px] items-center justify-center overflow-hidden rounded-[15px] bg-[#E9E8E8]/60 text-[#A5A4A3]"
          >
            {picker.photo ? (
              <img
                src={picker.preview}
                alt="선택한 사진 미리보기"
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
                <path
                  d="M4 5.5h10v2H6v10h12v-5h2v7H4v-14Z"
                  fill="currentColor"
                />
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
    </MobileLayout>
  );
}
