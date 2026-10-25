// 상황별 정보(수분 / 빨래 / 러닝) 관련 custom hook
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addHydrationRecord,
  deleteHydrationRecord,
  fetchHydration,
  fetchLaundry,
  fetchRunning,
} from "../api/situation";
import queryKeys from "../api/queryKeys";
import useLocationStore from "../store/useLocationStore";

// 로그인 여부와, 비로그인일 때 서버에 보낼 위치(regionCode)를 알려줌
//  - 로그인: 서버가 저장된 위치를 쓰므로 regionCode 는 필요 없음
//  - 비로그인: 홈 화면에서 고른 지역(useLocationStore.selected)의 regionCode 사용
//  - needsRegion: 비로그인인데 고른 지역도 없어서 요청할 수 없는 상태
export const useSituationLocation = () => {
  const selected = useLocationStore((state) => state.selected);
  const isLoggedIn = Boolean(localStorage.getItem("wee_access_token"));
  const regionCode =
    !isLoggedIn &&
    selected &&
    typeof selected === "object" &&
    selected.regionCode
      ? selected.regionCode
      : undefined;
  return { isLoggedIn, regionCode, needsRegion: !isLoggedIn && !regionCode };
};

// 기록 추가/삭제 성공 응답은 "수분 정보 조회"와 같은 모양이라서
// 캐시에 바로 덮어써서 화면을 즉시 갱신. (모양이 다르면 다시 불러오기)
const syncHydrationCache = (queryClient, data) => {
  if (data && Array.isArray(data.records)) {
    queryClient.setQueryData(queryKeys.hydration, data);
  } else {
    queryClient.invalidateQueries({ queryKey: queryKeys.hydration });
  }
};

// 오늘 수분 섭취 현황 조회 (로그인 사용자만 가능 -> 비로그인이면 요청하지 않음)
export const useHydrationQuery = () => {
  const { isLoggedIn } = useSituationLocation();
  return useQuery({
    queryKey: queryKeys.hydration,
    queryFn: fetchHydration,
    enabled: isLoggedIn,
  });
};

// 수분 섭취 기록 추가
export const useAddHydrationRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addHydrationRecord,
    retry: false,
    onSuccess: (data) => syncHydrationCache(queryClient, data),
  });
};

// 수분 섭취 기록 삭제
export const useDeleteHydrationRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHydrationRecord,
    retry: false,
    onSuccess: (data) => syncHydrationCache(queryClient, data),
  });
};

// 빨래 정보 조회 (로그인 없이도 가능, 비로그인이면 선택한 지역코드를 같이 보냄)
// staleTime 0: 홈에서 위치를 바꾸고 돌아왔을 때 바로 새 위치로 다시 불러오도록
export const useLaundryQuery = () => {
  const { regionCode, needsRegion } = useSituationLocation();
  return useQuery({
    queryKey: queryKeys.laundry(regionCode),
    queryFn: () => fetchLaundry({ regionCode }),
    enabled: !needsRegion,
    retry: false,
    staleTime: 0,
  });
};

// 러닝 날씨 정보 조회 (로그인 없이도 가능, 비로그인이면 선택한 지역코드를 같이 보냄)
export const useRunningQuery = () => {
  const { regionCode, needsRegion } = useSituationLocation();
  return useQuery({
    queryKey: queryKeys.running(regionCode),
    queryFn: () => fetchRunning({ regionCode }),
    enabled: !needsRegion,
    retry: false,
    staleTime: 0,
  });
};
