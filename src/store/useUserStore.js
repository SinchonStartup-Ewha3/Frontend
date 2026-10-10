import { create } from "zustand";
import { persist } from "zustand/middleware";

// 로그인한 사용자 요약 정보 (헤더/마이페이지 카드처럼 어디서나 빠르게 쓰는 값).
// 서버가 진짜 원본이라서, 프로필 query 가 성공할 때마다 hooks/useProfile.js 에서 동기화!!
const useUserStore = create(
  persist(
    (set) => ({
      user: null, // { id, nickname, region, profileImage }
      isPremium: false,
      setUser: (user) => set({ user }),
      setPremium: (isPremium) => set({ isPremium }),
      clearUser: () => set({ user: null, isPremium: false }),
    }),
    { name: "wee:user" },
  ),
);

export default useUserStore;
