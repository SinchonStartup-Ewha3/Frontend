import { useCallback, useEffect, useRef, useState } from "react";
import { initializePaddle } from "@paddle/paddle-js";
import { USE_MOCK } from "../api/config";

// ─────────────────────────────────────────────────────────────
// Paddle(Paddle Billing, Paddle.js v2) 결제창 훅 -> api 연결 하면서 코드 수정.. 및 검토 필요 ★
//  - 필요한 env:  VITE_PADDLE_CLIENT_TOKEN, VITE_PADDLE_ENV(sandbox|production),
//                VITE_PADDLE_PRICE_PREMIUM, VITE_PADDLE_PRICE_FORTUNE
//  - VITE_USE_MOCK=true 이거나 토큰이 없으면 -> 진짜 결제 없이 "성공"을 흉내냄 (화면 확인용)
//  - ⚠️ 결제 성공 여부의 최종 확인은 서버(Paddle webhook)가 해야 함!!!!!
//    여기서는 checkout.completed 이벤트만 받아서 서버에 "확인해줘" 하고 알려주는 정도로? 코드 짰어요 ㅠ
// 사용 예시: const { open, ready, loading } = usePaddleCheckout();
//         await open({ priceId, email, customData })  → { status: "completed", transactionId } | { status: "closed" }
// ─────────────────────────────────────────────────────────────
const TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN ?? "";
const ENV =
  import.meta.env.VITE_PADDLE_ENV === "production" ? "production" : "sandbox";

const usePaddleCheckout = () => {
  const paddleRef = useRef(null);
  const resolverRef = useRef(null); // 열려 있는 결제창의 결과를 돌려줄 resolve 함수
  const [ready, setReady] = useState(USE_MOCK || !TOKEN);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (USE_MOCK || !TOKEN) return;
    let cancelled = false;
    initializePaddle({
      environment: ENV,
      token: TOKEN,
      eventCallback: (event) => {
        if (event.name === "checkout.completed") {
          resolverRef.current?.({
            status: "completed",
            transactionId: event.data?.transaction_id,
          });
          resolverRef.current = null;
        }
        if (event.name === "checkout.closed") {
          resolverRef.current?.({ status: "closed" });
          resolverRef.current = null;
        }
      },
    }).then((paddle) => {
      if (cancelled) return;
      paddleRef.current = paddle;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const open = useCallback(async ({ priceId, email, customData } = {}) => {
    setLoading(true);
    try {
      // mock: 0.8초 뒤 결제 성공 처리
      if (USE_MOCK || !TOKEN) {
        await new Promise((r) => setTimeout(r, 800));
        return { status: "completed", transactionId: `mock_txn_${Date.now()}` };
      }
      if (!paddleRef.current) throw new Error("결제 모듈을 불러오는 중이에요");
      return await new Promise((resolve) => {
        resolverRef.current = resolve;
        paddleRef.current.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          customer: email ? { email } : undefined,
          customData,
          settings: { displayMode: "overlay", locale: "ko", theme: "light" },
        });
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { open, ready, loading };
};

export default usePaddleCheckout;
