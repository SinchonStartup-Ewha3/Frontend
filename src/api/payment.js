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
  const { data } = await api.get("/payments/subscription"); // TODO(BE)
  return data;
};

// Paddle 결제 완료 후 서버에 거래 확인 요청.
// ★ 실제로는 Paddle webhook 으로 서버가 결제를 검증해야 안전. 프론트의 "성공" 이벤트만 믿지 말기!
export const confirmPremiumPayment = async ({ transactionId }) => {
  if (USE_MOCK) {
    await delay(500);
    db.subscription = {
      active: true,
      planName: "맞춤형 행동 알림",
      paidAt: new Date().toISOString().slice(0, 10).replaceAll("-", "."),
      transactionId,
    };
    persist();
    return { ...db.subscription };
  }
  const { data } = await api.post("/payments/premium/confirm", {
    transactionId,
  }); // TODO(BE)
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

// 환불 요청 (환불 계좌 입력 화면) — { bank, account, phone }
export const requestRefund = async (payload) => {
  if (USE_MOCK) {
    await delay(600);
    db.refundRequests.push({
      ...payload,
      requestedAt: new Date().toISOString(),
    });
    db.subscription.active = false; // mock: 환불 요청하면 구독 해지로 처리
    persist();
    return { ok: true };
  }
  const { data } = await api.post("/payments/refund", payload); // TODO(BE)
  return data;
};
