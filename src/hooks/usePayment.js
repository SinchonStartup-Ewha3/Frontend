// 결제 기능 관련 custom hook
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmFortunePayment,
  createPayAppCheckout,
  fetchSubscription,
  fetchPremiumBilling,
  fetchRefundRequest,
  requestRefund,
  savePremiumProfile,
} from "../api/payment";
import queryKeys from "../api/queryKeys";
import useUserStore from "../store/useUserStore";

// 구독/이용권 정보. 결과로 isPremium 도 전역에 반영
export const useSubscriptionQuery = ({
  enabled = true,
  refetchOnMount = "always",
} = {}) => {
  const setPremium = useUserStore((s) => s.setPremium);
  const query = useQuery({
    queryKey: queryKeys.subscription,
    queryFn: fetchSubscription,
    enabled,
    staleTime: 0, // 관리자 수동 부여 등 서버 변경을 바로 반영
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

// 결제 화면 진입 시 서버 canCompleteSurvey를 확인하고, 가능하면 설문으로
// (진입 시점 1회만 판단: 결제 직후 흐름은 각 페이지가 직접 이동)
export const useRedirectIfPremium = ({ enabled = true } = {}) => {
  const navigate = useNavigate();
  const query = useSubscriptionQuery({ enabled });
  const done = useRef(false);
  const [isChecking, setIsChecking] = useState(enabled);
  useEffect(() => {
    if (!enabled) {
      setIsChecking(false);
      return;
    }
    if (done.current || query.isFetching) return;
    done.current = true;
    setIsChecking(false);
    if (query.data?.canCompleteSurvey)
      navigate("/premium/survey", { replace: true });
    else if (query.data?.subscription?.active)
      navigate("/premium", { replace: true });
  }, [enabled, query.isFetching, query.data, navigate]);
  return { isChecking };
};

const useInvalidateSubscription = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
};

export const useCreatePayAppCheckout = () =>
  useMutation({ mutationFn: createPayAppCheckout });

export const useSavePremiumProfile = () =>
  useMutation({ mutationFn: savePremiumProfile });

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
