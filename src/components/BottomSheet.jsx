import { useEffect, useId } from "react";

export default function BottomSheet({
  isOpen,
  title,
  onClose,
  children,
}) {
  const titleId = useId();

  // 열려 있는 동안 배경 스크롤을 막고 Escape 키로 닫습니다.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // 배경은 화면 전체에 깔고, 시트 영역만 서비스 너비로 제한합니다.
    <div className="fixed inset-0 z-50 flex justify-center">
      <button
        type="button"
        aria-label="바텀시트 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* 서비스 레이아웃과 같은 최대 너비 안에서 아래에 붙입니다. */}
      <div className="pointer-events-none relative flex h-full w-full max-w-[390px] items-end">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="pointer-events-auto max-h-[90dvh] w-full overflow-y-auto rounded-t-[30px] bg-white px-6 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
        >
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#D2D2D1]" />

          <header className="flex min-h-16 items-center justify-between gap-4">
            <h2
              id={titleId}
              className="text-xl font-semibold tracking-[-0.02em] text-[#252525]"
            >
              {title}
            </h2>

            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#797776] hover:bg-[#F4F4F4]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
              >
                <path
                  d="m6 6 12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>

          <div className="pb-6">{children}</div>
        </section>
      </div>
    </div>
  );
}