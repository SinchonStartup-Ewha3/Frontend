import { useEffect } from "react";
import useToastStore from "../store/useToastStore";

const DURATION = 2200; // ms

const TYPE_STYLE = {
  default: "bg-[#353331]/90",
  success: "bg-[#353331]/90",
  error: "bg-[#F35C4B]/95",
};

// 토스트 한 개: 2.2초 뒤 자동으로 사라져요
const ToastItem = ({ toast }) => {
  const remove = useToastStore((s) => s.remove);
  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, remove]);

  return (
    <div
      role="status"
      className={`pointer-events-auto max-w-[345px] rounded-full px-5 py-3 text-sm font-medium tracking-[-0.02em] text-white shadow-[0_4px_16px_rgba(0,0,0,0.18)] ${TYPE_STYLE[toast.type] ?? TYPE_STYLE.default}`}
    >
      {toast.message}
    </div>
  );
};

// main.jsx 에서 한 번만 렌더링 (화면 하단 네비게이션 위쪽에 표시)
const ToastContainer = () => {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[118px] z-[70] flex flex-col items-center gap-2 px-6"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
};

export default ToastContainer;
