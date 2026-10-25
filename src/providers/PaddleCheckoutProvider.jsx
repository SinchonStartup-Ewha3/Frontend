import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PADDLE_CLIENT_TOKEN, PADDLE_ENVIRONMENT, USE_MOCK } from "../api/config";
import { waitForPremiumStatus } from "../api/payment";
import queryKeys from "../api/queryKeys";
import useUserStore from "../store/useUserStore";
import PaddleCheckoutContext from "../contexts/PaddleCheckoutContext";
import { initializePaddleClient, subscribeToPaddleEvents } from "../services/paddleClient";

const paddleSetupError = !USE_MOCK && !PADDLE_CLIENT_TOKEN
  ? "Paddle sandbox client token을 설정해 주세요."
  : !USE_MOCK && PADDLE_ENVIRONMENT === "sandbox" && !PADDLE_CLIENT_TOKEN.startsWith("test_")
    ? "Sandbox 환경에서는 test_ client-side token이 필요해요."
    : "";

export function PaddleCheckoutProvider({ children }) {
  const queryClient = useQueryClient();
  const [paddle, setPaddle] = useState(null);
  const [ready, setReady] = useState(USE_MOCK);
  const [loading, setLoading] = useState(!USE_MOCK && !paddleSetupError);
  const [error, setError] = useState(paddleSetupError);

  useEffect(() => {
    if (USE_MOCK || paddleSetupError) return undefined;

    let cancelled = false;
    const handleCheckoutEvent = async (event) => {
      if (event?.name !== "checkout.completed") return;
      try {
        const status = await waitForPremiumStatus();
        useUserStore.getState().setPremium(Boolean(status?.subscription?.active));
        queryClient.setQueryData(queryKeys.subscription, status);
        await queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
        window.dispatchEvent(new CustomEvent("wee:paddle-checkout-completed", {
          detail: { transactionId: event?.data?.transaction_id ?? null, status },
        }));
      } catch (statusError) {
        window.dispatchEvent(new CustomEvent("wee:paddle-checkout-completed", {
          detail: { transactionId: event?.data?.transaction_id ?? null, error: statusError },
        }));
      }
    };
    const unsubscribe = subscribeToPaddleEvents(handleCheckoutEvent);

    initializePaddleClient({ environment: PADDLE_ENVIRONMENT, token: PADDLE_CLIENT_TOKEN })
      .then((instance) => {
        if (cancelled) return;
        if (!instance) throw new Error("Paddle Checkout을 불러오지 못했어요.");
        setPaddle(instance);
        setReady(true);
        setError("");
      })
      .catch((initializationError) => {
        if (cancelled) return;
        setError(initializationError?.message ?? "Paddle Checkout을 불러오지 못했어요.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [queryClient]);

  const open = useCallback(({ transactionId } = {}) => {
    if (!transactionId) throw new Error("결제 거래 번호를 받지 못했어요.");
    if (!paddle) throw new Error(error || "Paddle Checkout이 아직 준비되지 않았어요.");
    paddle.Checkout.open({ transactionId });
  }, [error, paddle]);

  return (
    <PaddleCheckoutContext.Provider value={{ ready, loading, error, open }}>
      {children}
    </PaddleCheckoutContext.Provider>
  );
}
