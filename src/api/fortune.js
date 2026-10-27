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
