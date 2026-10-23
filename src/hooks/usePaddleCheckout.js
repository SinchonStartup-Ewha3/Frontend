import { useCallback, useState } from "react";
import { USE_MOCK } from "../api/config";

// Paddle hosted checkout URL을 열고 창이 닫힐 때 반환합니다.
// 닫힘은 결제 완료를 뜻하지 않으므로, 호출부에서 서버 상태를 재조회해야 합니다.
const usePaddleCheckout = () => {
  const [loading, setLoading] = useState(false);

  const open = useCallback(async ({ checkoutUrl, popup } = {}) => {
    setLoading(true);
    try {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return { status: "completed" };
      }
      if (!checkoutUrl) throw new Error("결제창 주소를 받지 못했어요.");
      if (!popup || popup.closed) throw new Error("결제창을 열지 못했어요. 팝업을 허용해 주세요.");

      popup.opener = null;
      popup.location.href = checkoutUrl;
      await new Promise((resolve) => {
        const timer = window.setInterval(() => {
          if (popup.closed) {
            window.clearInterval(timer);
            resolve();
          }
        }, 500);
      });

      // 결제 성공 여부는 서버 웹훅을 반영한 상태 API로 확인합니다.
      return { status: "completed" };
    } finally {
      setLoading(false);
    }
  }, []);

  return { open, ready: true, loading };
};

export default usePaddleCheckout;
