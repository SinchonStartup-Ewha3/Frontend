import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT = 5;

// 위치 관련 전역 상태: 최근 검색한 지역 + 마지막으로 선택한 지역
// localStorage 에 저장돼서 새로고침해도 "최근 검색"이 남음
const useLocationStore = create(
  persist(
    (set) => ({
      recent: [
        "서울특별시 서대문구 아현동",
        "부산광역시 사하구",
        "서울특별시 강남구",
      ], // 초기 mock
      selected: null,
      // 지역 선택 시 호출: 최근 검색 맨 앞으로 (중복 제거, 최대 5개)
      selectRegion: (region) =>
        set((state) => ({
          selected: region,
          recent: [region, ...state.recent.filter((r) => r !== region)].slice(
            0,
            MAX_RECENT,
          ),
        })),
      clearRecent: () => set({ recent: [] }),
    }),
    { name: "wee:location" },
  ),
);

export default useLocationStore;
