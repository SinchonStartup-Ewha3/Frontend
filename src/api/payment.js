// 결제 관련 api 입니다
// TODO 주석은 나중에 api 연결 시 수정해야 하는 부분들 표시해둔 거라서!! 신경 안 쓰셔도 됩니당 !!

import api from "./axios";
import { USE_MOCK } from "./config";
import { db, delay, persist } from "../mocks/db";

// 구독/이용권 조회 (마이페이지 > 결제 관리, 프리미엄 여부 판단)
export const fetchSubscription = async () => {
  if (USE_MOCK) {
    await delay(200);
    const latestTransfer = db.bankTransferRequests?.at(-1);
    const isPremium = Boolean(db.subscription?.active || latestTransfer?.status === "APPROVED");
    return {
      isPremium,
      canCompleteSurvey: isPremium || latestTransfer?.status === "PENDING",
      bankTransferStatus: latestTransfer?.status ?? null,
      paymentMethod: latestTransfer?.status === "APPROVED" ? "BANK_TRANSFER" : null,
      subscription: { ...db.subscription },
      fortunePass: { ...db.fortunePass },
    };
  }
  const { data } = await api.get("/api/premium/status/");
  const isPremium = Boolean(data.isPremium);
  const canCompleteSurvey = Boolean(data.canCompleteSurvey ?? isPremium);
  const status = data.bankTransferStatus === "PENDING"
    ? "PENDING"
    : isPremium
      ? "ACTIVE"
      : data.premiumExpiresAt
        ? "COMPLETED"
        : "NONE";
  return {
    ...data,
    canCompleteSurvey,
    subscription: {
      active: isPremium,
      isActive: isPremium,
      status,
      paymentMethod: data.paymentMethod,
      bankTransferStatus: data.bankTransferStatus,
      canRequestRefund: Boolean(data.canRequestRefund),
      paidAt: data.premiumStartedAt,
      purchasedAt: data.premiumStartedAt,
      premiumStartedAt: data.premiumStartedAt,
      premiumExpiresAt: data.premiumExpiresAt,
      remainingSeconds: data.remainingSeconds,
    },
  };
};

// 마이페이지 결제 관리용: 최근 구매 및 환불 가능 여부
export const fetchPremiumBilling = async () => {
  if (USE_MOCK) {
    await delay(200);
    const mockSubscription = db.subscription?.active
      ? {
          purchaseId: 1,
          productName: "맞춤형 행동 알림",
          status: "COMPLETED",
          paymentMethod: db.subscription.paymentMethod ?? "PAYAPP",
          purchasedAt: db.subscription.paidAt,
          startedAt: db.subscription.paidAt,
          expiresAt: null,
          isActive: true,
          remainingSeconds: null,
          canRequestRefund: true,
        }
      : null;
    return { subscription: mockSubscription };
  }
  const { data } = await api.get("/api/premium/billing/");
  const subscription = data.subscription;
  return {
    subscription: subscription
      ? {
          ...subscription,
          active: Boolean(subscription.isActive),
          paidAt: subscription.purchasedAt,
          premiumExpiresAt: subscription.expiresAt,
        }
      : null,
  };
};

// 계좌이체 입금 확인 요청 — 서버가 금액과 통화를 지정해요.
export const createBankTransferRequest = async ({ depositorName }) => {
  const normalizedName = String(depositorName ?? "").trim();
  if (normalizedName.length < 2 || normalizedName.length > 30) {
    const error = new Error("입금자명을 2자 이상 입력해주세요.");
    error.response = {
      status: 400,
      data: { depositorName: [error.message] },
    };
    throw error;
  }

  if (USE_MOCK) {
    await delay(300);
    if (db.subscription?.active) {
      const error = new Error("이미 프리미엄을 이용 중입니다.");
      error.response = {
        status: 409,
        data: { detail: error.message, code: "PREMIUM_ALREADY_ACTIVE" },
      };
      throw error;
    }
    const pending = db.bankTransferRequests?.find((request) => request.status === "PENDING");
    if (pending) return { ...pending };
    const result = {
      requestId: Date.now(),
      depositorName: normalizedName,
      amount: 2500,
      currencyCode: "KRW",
      status: "PENDING",
      requestedAt: new Date().toISOString(),
      reviewedAt: null,
    };
    db.bankTransferRequests ??= [];
    db.bankTransferRequests.push(result);
    persist();
    return result;
  }

  const { data } = await api.post("/api/premium/bank-transfer-requests/", {
    depositorName: normalizedName,
  });
  return data;
};

export const createPayAppCheckout = async ({ recvphone }) => {
  const normalizedPhone = String(recvphone ?? "").replaceAll("-", "").trim();
  if (!/^01\d{8,9}$/.test(normalizedPhone)) {
    const error = new Error("휴대전화 번호는 하이픈 없이 입력해주세요.");
    error.response = {
      status: 400,
      data: { recvphone: [error.message] },
    };
    throw error;
  }
  const { data } = await api.post("/api/premium/payapp/checkout/", {
    recvphone: normalizedPhone,
  });
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
    return latest ?? null;
  }
  try {
    const { data } = await api.get("/api/premium/refund-requests/");
    return data;
  } catch (error) {
    if (
      error.response?.status === 404 &&
      error.response?.data?.code === "REFUND_REQUEST_NOT_FOUND"
    ) {
      return null;
    }
    throw error;
  }
};
