import { useId } from "react";
import Modal from "./Modal";

// 확인/취소 다이얼로그 (회원 탈퇴, 일정 삭제, 환불 요청 확인 등)
// 연한 하늘색 둥근 카드 + 아래에 [취소 | 확인] 두 칸 버튼
// - illustration: 상단 빈 공간(약 91px)에 넣을 이미지/캐릭터. 기본은 빈 공간.
// - cancelTone: "main"(하늘색, 기본) | "muted"(회색)  ← 삭제 다이얼로그는 회색
const ConfirmDialog = ({
  isOpen,
  title,
  description,
  cancelText = "취소",
  confirmText = "확인",
  cancelTone = "main",
  loading = false,
  illustration = null,
  onCancel,
  onConfirm,
}) => {
  const titleId = useId();

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="overflow-hidden rounded-[24px] bg-[#F4FAFF] text-center"
      >
        {/* 상단 이미지 영역 */}
        <div className="flex h-[91px] items-center justify-center">
          {illustration}
        </div>

        <h2
          id={titleId}
          className="whitespace-pre-line px-6 text-[15px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#1F1C1A]"
        >
          {title}
        </h2>
        <p className="mt-3 whitespace-pre-line px-6 text-xs leading-[15px] tracking-[-0.02em] text-[#8F8E8D]">
          {description}
        </p>

        {/* 버튼 2칸: 가운데 세로선 + 위쪽 가로선 */}
        <div className="mt-[25px] grid h-11 grid-cols-2 border-t border-[#A5A4A3]/70">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={`border-r border-[#A5A4A3]/70 text-[15px] font-medium ${
              cancelTone === "main" ? "text-main" : "text-[#BCBBBA]"
            }`}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="text-[15px] font-medium text-[#8F8E8D] disabled:opacity-50"
          >
            {loading ? "처리 중..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
