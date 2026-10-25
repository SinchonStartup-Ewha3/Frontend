import api from "./axios";
import useUserStore from "../store/useUserStore";
import { logoutOneSignalUser } from "../push/oneSignal";

export const loginWithKakao = async (kakaoAccessToken) => {
  const { data } = await api.post("/api/auth/social-login/", {
    provider: "KAKAO",
    access_token: kakaoAccessToken,
  }, {
    // Social login exchanges the Kakao token for JWTs in the response body;
    // browser cookies are not part of this endpoint's authentication contract.
    withCredentials: false,
  });

  return data;
};

export const logoutFromService = async () => {
  await logoutOneSignalUser().catch((error) =>
    console.warn("OneSignal 로그아웃 실패", error),
  );
  localStorage.removeItem("wee_access_token");
  localStorage.removeItem("wee_refresh_token");
  useUserStore.getState().clearUser();
  window.location.assign("/");
};
