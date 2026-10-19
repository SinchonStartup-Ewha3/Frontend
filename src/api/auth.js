import api from "./axios";
import useUserStore from "../store/useUserStore";

export const loginWithKakao = async (kakaoAccessToken) => {
  const { data } = await api.post("/api/auth/social-login/", {
    provider: "KAKAO",
    access_token: kakaoAccessToken,
  });

  return data;
};

export const logoutFromService = async () => {
  localStorage.removeItem("wee_access_token");
  localStorage.removeItem("wee_refresh_token");
  useUserStore.getState().clearUser();
  window.location.assign("/");
};
