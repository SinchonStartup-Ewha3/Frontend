// 위치 관련 api...
// TODO 주석은 나중에 api 연결 시 수정해야 하는 부분들 표시해둔 거라서!! 신경 안 쓰셔도 됩니당 !!
import api from "./axios";
import { USE_MOCK } from "./config";
import { delay } from "../mocks/db";
import { MOCK_REGIONS } from "../mocks/regions";

// 지역명 검색 -> ["서울특별시 서대문구 아현동", ...]
export const searchRegions = async (query) => {
  if (USE_MOCK) {
    await delay(150);
    const q = query.replace(/\s+/g, "");
    return MOCK_REGIONS.filter((r) => r.replace(/\s+/g, "").includes(q)).slice(
      0,
      8,
    );
  }
  const { data } = await api.get("/locations/search", { params: { q: query } }); // TODO(BE)
  return data;
};

// 좌표 -> 행정구역 이름 (현재 위치로 찾기)
export const reverseGeocode = async ({ latitude, longitude }) => {
  if (USE_MOCK) {
    await delay(400);
    // mock: 좌표와 상관없이 고정 값 반환 (실제 변환은 백엔드/카카오 로컬 API 연동 시)
    console.info("[mock] reverseGeocode", latitude, longitude);
    return "서울특별시 서대문구 아현동";
  }
  const { data } = await api.get("/locations/reverse", {
    params: { lat: latitude, lng: longitude },
  }); // TODO(BE)
  return data.region;
};
