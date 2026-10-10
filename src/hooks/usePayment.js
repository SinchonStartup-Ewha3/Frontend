// 결제 기능 관련 custom hook
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmFortunePayment,
  confirmPremiumPayment,
  fetchSubscription,
  requestRefund,
} from "../api/payment";
import queryKeys from "../api/queryKeys";
import useUserStore from "../store/useUserStore";

// 구독/이용권 정보. 결과로 isPremium 도 전역에 반영.
export const useSubscriptionQuery = () => {
  const setPremium = useUserStore((s) => s.setPremium);
  const query = useQuery({
    queryKey: queryKeys.subscription,
    queryFn: fetchSubscription,
  });
  const active = query.data?.subscription?.active;
  useEffect(() => {
    if (active !== undefined) setPremium(Boolean(active));
  }, [active, setPremium]);
  return query;
};

// 프리미엄 여부 (마이페이지 잠금 화면 분기 등에서 사용)
export const useIsPremium = () => {
  const { data, isLoading } = useSubscriptionQuery();
  const stored = useUserStore((s) => s.isPremium);
  return {
    isPremium: data ? Boolean(data.subscription?.active) : stored,
    isLoading,
  };
};

const useInvalidateSubscription = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
};

// 프리미엄 결제 완료 확인 (Paddle 결제 성공 직후 호출)
export const useConfirmPremiumPayment = () => {
  const invalidate = useInvalidateSubscription();
  return useMutation({
    mutationFn: confirmPremiumPayment,
    onSuccess: invalidate,
  });
};

// 운세 패키지 추가 구매 확인
export const useConfirmFortunePayment = () => {
  const invalidate = useInvalidateSubscription();
  return useMutation({
    mutationFn: confirmFortunePayment,
    onSuccess: invalidate,
  });
};

// 환불 요청
export const useRequestRefund = () => {
  const invalidate = useInvalidateSubscription();
  return useMutation({ mutationFn: requestRefund, onSuccess: invalidate });
};
