// 위치 관련 api...
// TODO 주석은 나중에 api 연결 시 수정해야 하는 부분들 표시해둔 거라서!! 신경 안 쓰셔도 됩니당 !!
import api from "./axios";
import { USE_MOCK } from "./config";
import { db, delay, persist } from "../mocks/db";
import { MOCK_REGIONS } from "../mocks/regions";

// 지역명 검색 -> [{ regionCode, regionName, shortName }, ...]
export const searchRegions = async (query) => {
  const normalizedQuery = query.trim();
  if (USE_MOCK) {
    await delay(150);
    const words = normalizedQuery.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return MOCK_REGIONS.map((regionName, index) => ({
      regionCode: String(index + 1).padStart(10, "0"),
      regionName,
      shortName: regionName.replace(/^(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원특별자치도|충청북도|충청남도|전북특별자치도|전라남도|경상북도|경상남도|제주특별자치도)\s*/, ""),
    })).filter((region) => {
      const name = region.regionName.toLocaleLowerCase();
      return words.every((word) => name.includes(word));
    }).slice(0, 20);
  }
  const { data } = await api.get("/api/regions/", {
    params: { q: normalizedQuery },
    skipAuth: true,
  });
  // API가 배열 또는 { results: [...] } / { data: [...] } 형태로 응답해도
  // 화면에서는 동일하게 지역 목록으로 다룹니다.
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.regions)) return data.regions;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

// 사용자 위치를 GPS 좌표 또는 검색한 행정구역 코드로 설정
export const updateUserLocation = async (payload) => {
  if (USE_MOCK) {
    await delay();
    const region =
      payload.locationMode === "MANUAL"
        ? (() => {
            const index = Number(payload.regionCode) - 1;
            const regionName = MOCK_REGIONS[index];
            if (!regionName) throw new Error("존재하지 않는 지역입니다.");
            const shortName = regionName.replace(/^[^ ]+\s*/, "");
            return { regionCode: payload.regionCode, regionName, shortName };
          })()
        : {
            regionCode: "0000000001",
            regionName: "서울특별시 서대문구 아현동",
            shortName: "서대문구 아현동",
          };
    db.user = { ...db.user, locationMode: payload.locationMode, region };
    persist();
    return {
      ...db.user,
      userId: db.user.userId ?? db.user.id,
      isNicknameSet: Boolean(db.user.nickname),
      isOnboarded: Boolean(db.user.nickname && region),
    };
  }

  const { data } = await api.patch("/api/users/me/location/", payload);
  return data;
};

// 좌표 -> 행정구역 이름 (현재 위치로 찾기)
export const reverseGeocode = async ({ latitude, longitude }) => {
  const user = await updateUserLocation({
    locationMode: "GPS",
    lat: latitude,
    lng: longitude,
  });

  return user.region.shortName;
};
