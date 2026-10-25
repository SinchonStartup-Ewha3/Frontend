// 결제 관련 api 입니다
// TODO 주석은 나중에 api 연결 시 수정해야 하는 부분들 표시해둔 거라서!! 신경 안 쓰셔도 됩니당 !!

import api from "./axios";
import { USE_MOCK } from "./config";
import { db, delay, persist } from "../mocks/db";

// 구독/이용권 조회 (마이페이지 > 결제 관리, 프리미엄 여부 판단)
export const fetchSubscription = async () => {
  if (USE_MOCK) {
    await delay(200);
    return {
      subscription: { ...db.subscription },
      fortunePass: { ...db.fortunePass },
    };
  }
  const { data } = await api.get("/api/premium/status/");
  const isPremium = Boolean(data.isPremium);
  return {
    ...data,
    subscription: {
      active: isPremium,
      isActive: isPremium,
      status: isPremium ? "ACTIVE" : data.premiumExpiresAt ? "COMPLETED" : "NONE",
      canRequestRefund: Boolean(data.canRequestRefund),
      paidAt: data.premiumStartedAt,
      purchasedAt: data.premiumStartedAt,
      premiumStartedAt: data.premiumStartedAt,
      premiumExpiresAt: data.premiumExpiresAt,
      remainingSeconds: data.remainingSeconds,
    },
  };
};

export const createPremiumCheckout = async () => {
  if (USE_MOCK) {
    await delay(200);
    const transactionId = `mock_txn_${Date.now()}`;
    return {
      purchaseId: Date.now(),
      transactionId,
      checkoutUrl: `https://sandbox-checkout.paddle.com/checkout/${transactionId}`,
      status: "PENDING",
    };
  }
  const { data } = await api.post("/api/premium/checkout/");
  return data;
};

// 프리미엄 설문 전체 저장 (최초 완료)
export const savePremiumProfile = async (payload) => {
  if (USE_MOCK) {
    await delay(250);
    db.surveyAnswers = {
      ...payload,
      isCompleted: true,
      surveyCompletedAt: db.surveyAnswers?.surveyCompletedAt ?? new Date().toISOString(),
    };
    persist();
    return { ...db.surveyAnswers };
  }
  const { data } = await api.put("/api/premium/profile/", payload);
  return data;
};

// 프리미엄 설문 일부 수정
export const patchPremiumProfile = async (payload) => {
  if (USE_MOCK) {
    await delay(250);
    db.surveyAnswers = { ...db.surveyAnswers, ...payload };
    persist();
    return { ...db.surveyAnswers };
  }
  const { data } = await api.patch("/api/premium/profile/", payload);
  return data;
};

export const waitForPremiumStatus = async ({ attempts = 8, intervalMs = 1500 } = {}) => {
  if (USE_MOCK) {
    db.subscription.active = true;
    persist();
  }
  let status;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    status = await fetchSubscription();
    if (status.subscription?.active) return status;
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
  return status;
};

// 날씨 운세 패키지 추가 구매 확인
export const confirmFortunePayment = async ({ transactionId }) => {
  if (USE_MOCK) {
    await delay(500);
    db.fortunePass.lastPaidAt = new Date()
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", ".");
    persist();
    return { ...db.fortunePass };
  }
  const { data } = await api.post("/payments/fortune/confirm", {
    transactionId,
  }); // TODO(BE)
  return data;
};

// 환불 요청 — { reason }
export const requestRefund = async (payload) => {
  if (USE_MOCK) {
    await delay(600);
    const result = {
      refundRequestId: Date.now(),
      purchaseId: 3,
      ...payload,
      requestedAmount: 2380,
      currencyCode: "KRW",
      remainingSeconds: 20 * 24 * 60 * 60,
      paddleAdjustmentId: "",
      status: "REQUESTED",
      rejectionReason: "",
      requestedAt: new Date().toISOString(),
      completedAt: null,
    };
    db.refundRequests.push(result);
    persist();
    return result;
  }
  const { data } = await api.post("/api/premium/refund-requests/", payload);
  return data;
};

export const fetchRefundRequest = async () => {
  if (USE_MOCK) {
    await delay(200);
    const latest = db.refundRequests.at(-1);
    if (!latest) {
      const error = new Error("환불 요청 내역이 없습니다.");
      error.response = { status: 404, data: { code: "REFUND_REQUEST_NOT_FOUND" } };
      throw error;
    }
    return latest;
  }
  const { data } = await api.get("/api/premium/refund-requests/");
  return data;
};
