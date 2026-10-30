import api from "./axios";

export const createFortuneProfile = async (payload) => {
  const { data } = await api.post("/api/fortune/profile/", payload);
  return data;
};

export const fetchFortuneProfile = async () => {
  const { data } = await api.get("/api/fortune/profile/");
  return data;
};

export const fetchTodayFortune = async () => {
  const { data } = await api.get("/api/fortune/results/today/");
  return data;
};

export const fetchMyFortunePurchases = async () => {
  const { data } = await api.get("/api/fortune/purchases/me/");
  return data;
};

export const redeemFortuneCoupon = async (code) => {
  const { data } = await api.post("/api/fortune/coupons/redeem/", { code });
  return data;
};

// 운세 상품 목록 (결제 요청에는 여기서 받은 id만 사용, 가격은 서버가 결정)
export const fetchFortuneProducts = async () => {
  const { data } = await api.get("/api/fortune/products/");
  return data;
};

// PayApp 결제 요청 -> { purchaseId, paymentUrl, status, purchase }
export const createFortuneCheckout = async ({ productId, recvphone }) => {
  const normalizedPhone = String(recvphone ?? "")
    .replaceAll("-", "")
    .trim();
  if (!/^01\d{8,9}$/.test(normalizedPhone)) {
    const error = new Error("휴대전화 번호는 하이픈 없이 입력해주세요.");
    error.response = { status: 400, data: { recvphone: [error.message] } };
    throw error;
  }
  const { data } = await api.post("/api/fortune/payapp/checkout/", {
    product_id: productId,
    recvphone: normalizedPhone,
  });
  return data;
};

// 주문(결제) 상태 조회 - PENDING | PAID | FAILED | CANCELED | REFUNDED
export const fetchFortunePurchase = async (purchaseId) => {
  const { data } = await api.get(`/api/fortune/purchases/${purchaseId}/`);
  return data;
};

// 운세 이용권 환불 요청 - { purchaseId, reason }
export const requestFortuneRefund = async ({ purchaseId, reason }) => {
  const { data } = await api.post("/api/fortune/refund-requests/", {
    purchaseId,
    reason,
  });
  return data;
};

// 가장 최근 운세 환불 요청 (없으면 null)
export const fetchFortuneRefundRequest = async () => {
  try {
    const { data } = await api.get("/api/fortune/refund-requests/");
    return data;
  } catch (error) {
    if (
      error.response?.status === 404 &&
      error.response?.data?.code === "FORTUNE_REFUND_NOT_FOUND"
    ) {
      return null;
    }
    throw error;
  }
};
