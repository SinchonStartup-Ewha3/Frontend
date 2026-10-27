import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT = 5;
const MOCK_RECENT = new Set([
  "서울특별시 서대문구 아현동",
  "부산광역시 사하구",
  "서울특별시 강남구",
]);

const getRegionName = (region) =>
  typeof region === "string" ? region : region?.regionName ?? region?.shortName;

const normalizeRecent = (recent = []) =>
  [...new Set(recent.map(getRegionName).filter(Boolean))].slice(0, MAX_RECENT);

// 위치 관련 전역 상태: 최근 검색한 지역 + 마지막으로 선택한 지역
// localStorage 에 저장돼서 새로고침해도 "최근 검색"이 남음
const useLocationStore = create(
  persist(
    (set) => ({
      recent: [],
      selected: null,
      coordinates: null,
      // 지역 선택 시 호출: 최근 검색 맨 앞으로 (중복 제거, 최대 5개)
      selectRegion: (region) =>
        set((state) => {
          const regionName = getRegionName(region);
          const isLoggedIn = Boolean(localStorage.getItem("wee_access_token"));
          return {
            selected: region,
            coordinates: null,
            recent: isLoggedIn && regionName
              ? [regionName, ...normalizeRecent(state.recent).filter((name) => name !== regionName)].slice(
                  0,
                  MAX_RECENT,
                )
              : normalizeRecent(state.recent),
          };
        }),
      setCoordinates: (coordinates) => set({ coordinates, selected: null }),
      clearRecent: () => set({ recent: [] }),
    }),
    {
      name: "wee:location",
      version: 1,
      migrate: (persistedState) => ({
        ...persistedState,
        recent: normalizeRecent(persistedState?.recent).filter(
          (name) => !MOCK_RECENT.has(name),
        ),
      }),
      partialize: (state) => ({
        recent: state.recent,
        selected: state.selected,
        coordinates: state.coordinates,
      }),
    },
  ),
);

export default useLocationStore;
