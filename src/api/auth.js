import api from "./axios";

export const loginWithKakao = async (kakaoAccessToken) => {
  const { data } = await api.post("/api/auth/social-login/", {
    provider: "KAKAO",
    access_token: kakaoAccessToken,
  });

  return data;
};
