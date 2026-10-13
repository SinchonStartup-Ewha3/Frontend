import { useEffect } from "react";

// 화면 전체를 어둡게 덮는 오버레이 + 가운데 내용 (토스트/다이얼로그 배경 오버레이 공통 틀)
//  - 배경(오버레이)을 누르면 onClose, ESC 로도 닫혀요.
//  - 열려 있는 동안 본문 스크롤을 막습니다.
const Modal = ({ isOpen, onClose, children, overlayClassName = "bg-black/40", closeOnOverlay = true }) => {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const onKeyDown = (e) => e.key === "Escape" && onClose?.();
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-[33px]">
      {/* 어두운 배경 오버레이 */}
      <button
        type="button"
        aria-label="닫기"
        tabIndex={-1}
        onClick={closeOnOverlay ? onClose : undefined}
        className={`absolute inset-0 cursor-default ${overlayClassName}`}
      />
      <div className="relative w-full max-w-[327px]">{children}</div>
    </div>
  );
};

export default Modal;
