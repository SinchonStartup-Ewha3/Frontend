// 위치 기능 custom hook
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reverseGeocode, searchRegions } from "../api/location";
import queryKeys from "../api/queryKeys";
import useDebounce from "./useDebounce";

// 지역명 검색 (입력 멈춘 뒤 호출). query 가 비면 요청하지 않도록
export const useRegionSearch = (query) => {
  const debounced = useDebounce(query.trim(), 250);
  return useQuery({
    queryKey: queryKeys.regions(debounced),
    queryFn: () => searchRegions(debounced),
    enabled: debounced.length > 0,
  });
};

// 브라우저 Geolocation 으로 "현재 위치로 찾기".
// const { locate, loading, error } = useCurrentRegion(); const region = await locate(); -> 이런 느낌으로 사용!!!!
// *** HTTPS(또는 localhost)에서만 동작 / 사용자가 권한을 거부하면 error 에 메시지가 담기도록
export const useCurrentRegion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const locate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!("geolocation" in navigator))
        throw new Error("이 브라우저는 위치 기능을 지원하지 않아요");
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 60_000,
        }),
      );
      return await reverseGeocode(position.coords);
    } catch (e) {
      // GeolocationPositionError.code: 1=권한거부, 2=위치불가, 3=시간초과
      const message =
        e?.code === 1
          ? "위치 권한이 꺼져 있어요. 브라우저 설정에서 허용해 주세요"
          : e?.code === 3
            ? "위치를 가져오는 데 너무 오래 걸려요. 다시 시도해 주세요"
            : (e?.message ?? "현재 위치를 찾지 못했어요");
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { locate, loading, error };
};
