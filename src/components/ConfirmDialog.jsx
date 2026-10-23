import { useId } from "react";
import Modal from "./Modal";
import withdrawalImage from "../assets/images/withdraw-confirmation.png";
import scheduleDeleteImage from "../assets/images/schedule-delete-confirmation.png";
import loginRequiredImage from "../assets/images/login-required.png";

const variants = {
  withdraw: {
    title: "탈퇴하시겠습니까?",
    description: "탈퇴하실 경우 현재까지의 모든 데이터가 삭제되고,\n재가입하셔야 합니다.",
    cancelText: "취소",
    confirmText: "탈퇴",
    image: withdrawalImage,
    imageFrame: "h-[66px] w-[79px]",
    imageCrop: "left-[-7.39%] top-[-6.9%] h-[113.79%] w-[114.78%]",
    contentSpacing: "mt-[6px]",
    contentPadding: "pb-4",
  },
  refund: {
    title: "환불 요청을 완료하시겠습니까?",
    description: "입력한 정보는 환불 절차가 완료된 이후 폐기되며,\n요청 이후 환불 절차가 진행됩니다.",
    cancelText: "취소",
    confirmText: "확인",
    image: scheduleDeleteImage,
    imageFrame: "h-[68px] w-[67px]",
    imageFrameMargin: "mt-[5px]",
    imageViewport: "absolute left-0 top-[4px] h-[60px] w-[67px]",
    imageCrop: "left-[-22.95%] top-[-22.73%] h-[136.36%] w-[147.54%]",
    contentSpacing: "mt-[5px]",
    contentPadding: "pb-[15px]",
    buttonAreaSpacing: "mt-[6px]",
  },
  scheduleDelete: {
    title: "‘일정 이름’ 일정을\n삭제할까요?",
    description: "삭제하면 이 일정에 대한\n날씨 알림을 더 이상 받을 수 없어요",
    cancelText: "취소",
    confirmText: "삭제",
    image: scheduleDeleteImage,
    imageFrame: "h-[68px] w-[67px]",
    imageFrameMargin: "mt-[5px]",
    imageViewport: "absolute left-0 top-[4px] h-[60px] w-[67px]",
    imageCrop: "left-[-22.95%] top-[-22.73%] h-[136.36%] w-[147.54%]",
    contentSpacing: "mt-[5px]",
    contentPadding: "pb-[15px]",
    buttonAreaSpacing: "mt-[6px]",
  },
  postDelete: {
    title: "게시글을 삭제할까요?",
    description: "삭제한 게시글은 다시 복구할 수 없어요.",
    cancelText: "취소",
    confirmText: "삭제",
    image: scheduleDeleteImage,
    imageFrame: "h-[68px] w-[67px]",
    imageFrameMargin: "mt-[5px]",
    imageViewport: "absolute left-0 top-[4px] h-[60px] w-[67px]",
    imageCrop: "left-[-22.95%] top-[-22.73%] h-[136.36%] w-[147.54%]",
    contentSpacing: "mt-[5px]",
    contentPadding: "pb-[15px]",
    buttonAreaSpacing: "mt-[6px]",
  },
  loginRequired: {
    title: "로그인이 필요한 기능입니다",
    description: "로그인 / 회원가입을 통해 기능을 이용해보세요!",
    cancelText: "로그인 / 회원가입",
    confirmText: "취소",
    image: loginRequiredImage,
    imageFrame: "h-[69px] w-[76px]",
    imageCrop: "left-[-15.78%] top-[-9.3%] h-[114.5%] w-[125.36%]",
    contentSpacing: "mt-[10px]",
    contentPadding: "pb-[10px]",
    buttonAreaSpacing: "mt-1",
  },
};

const ConfirmDialog = ({
  isOpen,
  variant = "withdraw",
  title,
  description,
  cancelText,
  confirmText,
  cancelTone = "main",
  loading = false,
  illustration,
  onCancel,
  onConfirm,
  onDismiss,
}) => {
  const titleId = useId();
  const preset = variants[variant] ?? variants.withdraw;

  return (
    <Modal isOpen={isOpen} onClose={onDismiss ?? onCancel} overlayClassName={variant === "loginRequired" ? "bg-black/45" : undefined}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={`${titleId}-description`}
        className={`${variant === "loginRequired" ? "overflow-hidden rounded-[8px] bg-[#F4FAFF] shadow-[0px_5px_8px_rgba(0,0,0,0.15),5px_0px_8px_rgba(0,0,0,0.15)]" : "overflow-hidden rounded-[16px] border border-[#D2D2D1] bg-[#F4FAFF] shadow-[0px_4px_4px_rgba(165,164,163,0.18)]"} text-center`}
      >
        <div className={`px-4 pt-3 ${preset.contentPadding}`}>
          <div className={`relative mx-auto overflow-hidden ${preset.imageFrameMargin ?? ""} ${preset.imageFrame}`}>
            {illustration ?? (
              <div className={preset.imageViewport ?? "absolute inset-0"}>
                <img
                  src={preset.image}
                  alt=""
                  className={`absolute max-w-none ${preset.imageCrop}`}
                />
              </div>
            )}
          </div>

          <h2
            id={titleId}
            className={`${preset.contentSpacing} whitespace-pre-line text-[17px] font-semibold leading-[22px] tracking-[-0.4px] text-[#1F1C1A]`}
          >
            {title ?? preset.title}
          </h2>
          <p id={`${titleId}-description`} className={`${preset.contentSpacing} whitespace-pre-line text-[13px] leading-[18px] tracking-[-0.4px] text-[#8F8E8D]`}>
            {description ?? preset.description}
          </p>
        </div>

        <div className={`flex h-11 ${variant === "loginRequired" ? "" : "border-t-[0.333px] border-[#A5A4A3]"} ${preset.buttonAreaSpacing ?? ""}`}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={`flex-1 text-center leading-[22px] tracking-[-0.43px] ${variant === "loginRequired" ? "border-t-[0.333px] border-t-[var(--G40,#A5A4A3)] text-[16px]" : "text-[17px]"} font-semibold ${cancelTone === "main" ? "text-main" : cancelTone === "light" ? "text-[#BCBBBA]" : "text-[#8F8E8D]"}`}
          >
            {cancelText ?? preset.cancelText}
          </button>
          <span aria-hidden="true" className="h-11 w-[0.333px] bg-[var(--G40,#A5A4A3)]" />
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 text-center leading-[22px] tracking-[-0.43px] text-[#8F8E8D] disabled:opacity-50 ${variant === "loginRequired" ? "border-t-[0.333px] border-t-[var(--G40,#A5A4A3)] text-[16px]" : "text-[17px]"} font-medium`}
          >
            {loading ? "처리 중..." : confirmText ?? preset.confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
