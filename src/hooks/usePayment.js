// 결제 기능 관련 custom hook
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmFortunePayment,
  createPremiumCheckout,
  fetchSubscription,
  fetchPremiumBilling,
  fetchRefundRequest,
  requestRefund,
  savePremiumProfile,
  waitForPremiumStatus,
} from "../api/payment";
import queryKeys from "../api/queryKeys";
import useUserStore from "../store/useUserStore";

// 구독/이용권 정보. 결과로 isPremium 도 전역에 반영.
export const useSubscriptionQuery = ({ enabled = true, refetchOnMount } = {}) => {
  const setPremium = useUserStore((s) => s.setPremium);
  const query = useQuery({
    queryKey: queryKeys.subscription,
    queryFn: fetchSubscription,
    enabled,
    refetchOnMount,
  });
  const active = query.data?.subscription?.active;
  useEffect(() => {
    if (active !== undefined) setPremium(Boolean(active));
  }, [active, setPremium]);
  return query;
};

export const usePremiumBillingQuery = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: queryKeys.premiumBilling,
    queryFn: fetchPremiumBilling,
    enabled,
    retry: false,
  });

export const useRefundRequestQuery = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: queryKeys.refundRequest,
    queryFn: fetchRefundRequest,
    enabled,
    retry: false,
  });

// 프리미엄 여부 (마이페이지 잠금 화면 분기 등에서 사용)
export const useIsPremium = ({ enabled = true } = {}) => {
  const { data, isLoading } = useSubscriptionQuery({ enabled });
  return {
    isPremium: Boolean(data?.subscription?.active),
    isLoading,
  };
};

const useInvalidateSubscription = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
};

// 거래 생성은 백엔드가 담당하고 권한 갱신은 웹훅 반영 상태를 재조회한다.
export const useCreatePremiumCheckout = () => {
  return useMutation({ mutationFn: createPremiumCheckout });
};

export const useSavePremiumProfile = () =>
  useMutation({ mutationFn: savePremiumProfile });

export const useRefreshPremiumStatus = () => {
  const invalidate = useInvalidateSubscription();
  return useMutation({
    mutationFn: waitForPremiumStatus,
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestRefund,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.refundRequest, data);
      invalidate();
    },
  });
};
