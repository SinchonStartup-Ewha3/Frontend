// 날씨 운세 이용권(PayApp 결제 / 코인 / 환불) 관련 custom hook
import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFortuneCheckout,
  fetchFortuneProducts,
  fetchFortunePurchase,
  fetchFortuneRefundRequest,
  fetchMyFortunePurchases,
  requestFortuneRefund,
} from "../api/fortune";
import queryKeys from "../api/queryKeys";

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_MS = 3 * 60 * 1000; // 결제창에서 결제를 마칠 시간을 넉넉히 기다려요

// 상품 목록 (id 는 DB 마다 달라질 수 있어서 항상 조회 결과를 사용)
export const useFortuneProductsQuery = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: queryKeys.fortuneProducts,
    queryFn: fetchFortuneProducts,
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
  });

// 내 이용권 + 코인 (current / upcoming / latest / coins)
// 코인은 사주를 볼 때마다 서버에서 바뀌므로 화면에 들어올 때마다 새로 받아요
export const useFortunePurchasesQuery = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: queryKeys.fortunePurchases,
    queryFn: fetchMyFortunePurchases,
    enabled,
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
  });

// 가장 최근 환불 요청
export const useFortuneRefundQuery = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: queryKeys.fortuneRefund,
    queryFn: fetchFortuneRefundRequest,
    enabled,
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
  });

export const useCreateFortuneCheckout = () =>
  useMutation({ mutationFn: createFortuneCheckout });

// 결제 상태 폴링: PENDING 인 동안 2초마다 재조회, 최대 3분
// - PAID/FAILED/CANCELED/REFUNDED 가 되면 멈춤
// - 404/403(남의 주문 등)이면 멈춤
// - restart() 로 다시 확인 시작
export const useFortunePurchaseStatus = (
  purchaseId,
  { enabled = true } = {},
) => {
  const [runKey, setRunKey] = useState(0);
  const [timedOutKey, setTimedOutKey] = useState(null);
  const active = Boolean(enabled && purchaseId);
  const currentKey = `${purchaseId}:${runKey}`;
  // 타이머가 울린 "그 회차(주문+restart 횟수)"만 시간 초과로 취급 -> restart 하면 자동으로 해제
  const isTimedOut = timedOutKey === currentKey;

  useEffect(() => {
    if (!active) return undefined;
    const timer = window.setTimeout(
      () => setTimedOutKey(currentKey),
      POLL_MAX_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, currentKey]);

  const query = useQuery({
    queryKey: [...queryKeys.fortunePurchase(purchaseId), runKey],
    queryFn: () => fetchFortunePurchase(purchaseId),
    enabled: active,
    retry: 2,
    staleTime: 0,
    gcTime: 0,
    refetchInterval: (q) => {
      if (isTimedOut) return false;
      const status = q.state.error?.response?.status;
      if (status === 404 || status === 403) return false;
      const paymentStatus = q.state.data?.payment_status;
      return !paymentStatus || paymentStatus === "PENDING"
        ? POLL_INTERVAL_MS
        : false;
    },
  });

  // 결제창 탭에서 돌아오면 바로 한 번 확인
  const { refetch } = query;
  useEffect(() => {
    if (!active) return undefined;
    const onVisible = () => {
      if (document.visibilityState === "visible") refetch();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [active, refetch]);

  const restart = useCallback(() => setRunKey((key) => key + 1), []);

  return {
    purchase: query.data,
    paymentStatus: query.data?.payment_status ?? null,
    error: query.error,
    isError: query.isError,
    isTimedOut:
      isTimedOut && (query.data?.payment_status ?? "PENDING") === "PENDING",
    restart,
  };
};

// 결제/쿠폰/환불 후 운세·이용권 화면 데이터를 새로 받게 하는 함수
export const useRefreshFortuneData = () => {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.todayFortune }),
      queryClient.invalidateQueries({ queryKey: queryKeys.fortunePurchases }),
    ]);
  }, [queryClient]);
};

// 환불 요청
export const useRequestFortuneRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestFortuneRefund,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.fortuneRefund, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.fortunePurchases });
    },
  });
};
