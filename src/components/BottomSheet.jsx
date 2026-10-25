import { useEffect, useId } from "react";
import { createPortal } from "react-dom";

// 아래에서 올라오는 시트 (위치 검색 / 프리미엄 결제창 등에서 사용)
// 기존 props 는 그대로 + 아래 3개가 추가
//  - showHeader   : false 면 제목 줄을 아예 그리지 않음 (제목은 스크린리더용으로만 유지)
//  - className    : 시트(흰 박스)에 추가할 클래스. 배경색 바꿀 땐 !bg-... 로 덮어쓰기
//  - closeClassName: 닫기(X) 버튼 색/스타일 덮어쓰기
const BottomSheet = ({
  isOpen,
  title,
  onClose,
  children,
  showHandle = true,
  showClose = true,
  showHeader = true,
  backdropClassName = "bg-black/40",
  titleClassName = "",
  className = "",
  closeClassName = "",
  hideScrollbar = false,
}) => {
  const titleId = useId();

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

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal((
    <div className="fixed inset-0 z-50 flex justify-center">
      <button
        type="button"
        aria-label="바텀시트 닫기"
        onClick={onClose}
        className={`absolute inset-0 ${backdropClassName}`}
      />
      <div className="pointer-events-none relative flex h-full w-full max-w-[390px] items-end">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`pointer-events-auto max-h-[90dvh] w-full overflow-y-auto rounded-t-[30px] bg-white px-6 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.12)] ${hideScrollbar ? "hide-scrollbar" : ""} ${className}`}
        >
          {showHandle && (
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#D2D2D1]" />
          )}

          {showHeader ? (
            <header
              className={`flex min-h-16 items-center ${showClose ? "justify-between" : "justify-start"} gap-4`}
            >
              <h2
                id={titleId}
                className={`text-xl font-semibold tracking-[-0.02em] text-[#252525] ${titleClassName}`}
              >
                {title}
              </h2>

              {showClose && (
                <button
                  type="button"
                  aria-label="닫기"
                  onClick={onClose}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#797776] hover:bg-[#F4F4F4] ${closeClassName}`}
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
              )}
            </header>
          ) : (
            <h2 id={titleId} className="sr-only">
              {title}
            </h2>
          )}

          <div className="pb-6">{children}</div>
        </section>
      </div>
    </div>
  ), document.body);
};

export default BottomSheet;
