import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";

const tags = ["가디건", "패딩", "코트"];

export default function CommunityWritePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedTags, setSelectedTags] = useState(["가디건"]);
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    if (!photo) {
      setPhotoPreview("");
      return undefined;
    }
    const previewUrl = URL.createObjectURL(photo);
    setPhotoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [photo]);

  const toggleTag = (tag) => {
    setSelectedTags((current) => current.includes(tag)
      ? current.filter((item) => item !== tag)
      : [...current, tag]);
  };

  const close = () => navigate("/community");
  const submit = () => {
    if (!message.trim()) return;
    sessionStorage.setItem("community:last-post", JSON.stringify({
      message: message.trim(),
      tags: selectedTags,
      photoName: photo?.name ?? "",
      createdAt: Date.now(),
    }));
    close();
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[390px] overflow-hidden bg-white text-[#353331]">
        <div className="absolute left-[23px] right-[23px] top-[74px]">
          <Header left="취소" right="등록" onLeft={close} onRight={submit} rightDisabled={!message.trim()} />
        </div>

        <section className="absolute left-[24px] right-[24px] top-[136px]" aria-labelledby="outfit-tags-title">
          <h1 id="outfit-tags-title" className="text-[20px] font-semibold leading-[1.38] tracking-[-0.6px]">태그</h1>
          <div className="mt-[18px] flex gap-[8px]">
            {tags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleTag(tag)}
                  className={`flex h-[36px] items-center gap-[5px] rounded-full border px-[12px] text-[14px] font-semibold leading-[1.5] tracking-[-0.42px] ${active ? "border-[#60E1FF] bg-[#60E1FF] text-white" : "border-[#D2D2D1] bg-white text-[#A5A4A3]"}`}
                >
                  {tag}<span aria-hidden="true" className="text-[15px] font-normal">×</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="absolute left-[24px] right-[24px] top-[248px]" aria-labelledby="community-message-title">
          <h2 id="community-message-title" className="text-[20px] font-semibold leading-[1.38] tracking-[-0.6px]">한마디</h2>
          <div className="relative mt-[17px] h-[181px] rounded-[15px] bg-[#E9E8E8]/60">
            <textarea
              maxLength={100}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="오늘 착장 한마디"
              aria-label="커뮤니티에 남길 한마디"
              className="h-full w-full resize-none rounded-[15px] bg-transparent px-[21px] py-[15px] text-[16px] font-medium leading-[1.5] tracking-[-0.48px] text-[#353331] outline-none placeholder:text-[#A5A4A3]"
            />
          </div>
          <div className="mt-[9px] flex items-start justify-between gap-2 text-[14px] font-medium leading-[1.5] tracking-[-0.42px] text-[#A5A4A3]">
            <p>작성한 후기는 AI 요약과 오늘의 체감 정보에 반영돼요.<br />정확한 위치는 공개되지 않습니다</p>
            <span className="shrink-0">{message.length} / 100</span>
          </div>
        </section>

        <section className="absolute left-[24px] top-[553px]" aria-labelledby="community-photo-title">
          <h2 id="community-photo-title" className="text-[20px] font-semibold leading-[1.38] tracking-[-0.6px]">사진</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            aria-label={photo ? `사진 선택됨: ${photo.name}. 사진 변경` : "사진 추가"}
            onClick={() => fileInputRef.current?.click()}
            className="mt-[17px] flex h-[76px] w-[78px] items-center justify-center overflow-hidden rounded-[15px] bg-[#E9E8E8]/60 text-[#A5A4A3]"
          >
            {photo ? (
              <img src={photoPreview} alt="선택한 사진 미리보기" className="h-full w-full object-cover" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 5.5h10v2H6v10h12v-5h2v7H4v-14Z" fill="currentColor" />
                <path d="m7 16 3.2-3.4 2.2 2.2 3.3-4 4.3 5.2H7Z" fill="currentColor" />
                <path d="M18 3v5m-2.5-2.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </section>

        <BottomNav />
      </main>
    </MobileLayout>
  );
}
