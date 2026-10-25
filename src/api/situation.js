// 상황별 정보(수분 / 빨래 / 러닝) 관련 api들
import api from "./axios";
import { USE_MOCK } from "./config";
import { delay } from "../mocks/db";
import { MOCK_REGIONS } from "../mocks/regions";
import { toDateString } from "../utils/situation";

// ─────────────────────────────────────────────────────────────
// mock 용 가짜 데이터 (VITE_USE_MOCK=true 일 때만 사용)
// 수분 기록은 메모리에만 저장돼서 새로고침하면 초기화
// ─────────────────────────────────────────────────────────────
const MOCK_REGION = {
  regionCode: "1114052000",
  regionName: "서울특별시 중구 소공동",
  shortName: "중구 소공동",
};
// 비로그인 mock: regionCode 로 지역 만들기 (mocks/regions.js 의 순번 + 1 = 코드)
const getMockRegion = (regionCode) => {
  const regionName = regionCode ? MOCK_REGIONS[Number(regionCode) - 1] : null;
  if (!regionName) return MOCK_REGION;
  return {
    regionCode,
    regionName,
    shortName: regionName.replace(/^[^ ]+\s*/, ""),
  };
};
let mockHydrationRecords = [];
let mockNextRecordId = 1;

// 현재 mock 기록들로 "수분 정보 조회" 응답 모양을 만들어줌
const buildMockHydration = () => {
  const recommendedMl = 1500;
  const currentMl = mockHydrationRecords.reduce(
    (sum, record) => sum + record.amountMl,
    0,
  );
  const hourly = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    amountMl: mockHydrationRecords
      .filter((record) => Number(record.time.slice(0, 2)) === hour)
      .reduce((sum, record) => sum + record.amountMl, 0),
  }));
  const records = [...mockHydrationRecords].sort(
    (a, b) => a.time.localeCompare(b.time) || a.recordId - b.recordId,
  );
  return {
    situation: "HYDRATION",
    date: toDateString(new Date()),
    recommendedMl,
    currentMl,
    percent: Math.round((currentMl / recommendedMl) * 100),
    humidity: 65,
    message:
      "오늘의 습도는 65%로, 적당한 날씨예요. 하루 동안 조금씩 나눠서 물을 마셔 주세요.",
    skinTip:
      "세안 후 가벼운 로션으로 수분을 채워주세요. 외출 전 미스트를 챙기면 좋아요.",
    hourly,
    records,
  };
};

// ─────────────────────────────────────────────────────────────
// 3.1 수분 정보 조회  GET /api/situations/hydration/
// ─────────────────────────────────────────────────────────────
export const fetchHydration = async () => {
  if (USE_MOCK) {
    await delay();
    return buildMockHydration();
  }
  const { data } = await api.get("/api/situations/hydration/");
  return data;
};

// 수분 섭취 기록 추가  POST /api/situations/hydration/records/
// payload: { time: "21:00", amountMl: 180 }  (성공하면 수분 정보 조회와 같은 모양을 돌려줌)
export const addHydrationRecord = async ({ time, amountMl }) => {
  if (USE_MOCK) {
    await delay(250);
    mockHydrationRecords.push({
      recordId: mockNextRecordId,
      time,
      amountMl,
    });
    mockNextRecordId += 1;
    return buildMockHydration();
  }
  const { data } = await api.post("/api/situations/hydration/records/", {
    time,
    amountMl,
  });
  return data;
};

// 수분 섭취 기록 삭제  DELETE /api/situations/hydration/records/{recordId}/
export const deleteHydrationRecord = async (recordId) => {
  if (USE_MOCK) {
    await delay(250);
    const exists = mockHydrationRecords.some(
      (record) => record.recordId === recordId,
    );
    if (!exists) throw new Error("삭제할 기록을 찾지 못했어요.");
    mockHydrationRecords = mockHydrationRecords.filter(
      (record) => record.recordId !== recordId,
    );
    return buildMockHydration();
  }
  const { data } = await api.delete(
    `/api/situations/hydration/records/${recordId}/`,
  );
  return data;
};

// ─────────────────────────────────────────────────────────────
// 3.2 빨래 정보 조회  GET /api/situations/laundry/
//  - 로그인: 저장된 위치 기준 (파라미터 없음)
//  - 비로그인: ?regionCode=지역코드 로 위치를 보내야
// ─────────────────────────────────────────────────────────────
export const fetchLaundry = async ({ regionCode } = {}) => {
  if (USE_MOCK) {
    await delay();
    return {
      situation: "LAUNDRY",
      region: getMockRegion(regionCode),
      targetDate: toDateString(new Date()),
      score: 86,
      summary:
        "오늘은 강수 20%, 습도 44%, 풍속 약함으로 예상돼요. 비가 오지 않고 습도도 낮아 빨래하기에 적합한 날씨예요.",
      overview: {
        precipitationProbability: 20.0,
        humidity: 44,
        windSpeed: 0.4,
        windLabel: "약함",
      },
      recommendedTime: { start: "12:00", end: "15:00" },
      recommendedMessage:
        "12:00 - 15:00 사이가 습도가 낮고 비 소식이 없어 가장 좋아요.",
    };
  }
  // regionCode 가 없으면 params 를 아예 보내지 않음 (로그인 사용자)
  const { data } = await api.get("/api/situations/laundry/", {
    params: regionCode ? { regionCode } : undefined,
  });
  return data;
};

// ─────────────────────────────────────────────────────────────
// 3.4 러닝 날씨 정보 조회  GET /api/situations/running/
//  - 로그인: 저장된 위치 기준 (파라미터 없음)
//  - 비로그인: ?regionCode=지역코드 로 위치를 보내야 해요
// ─────────────────────────────────────────────────────────────
export const fetchRunning = async ({ regionCode } = {}) => {
  if (USE_MOCK) {
    await delay();
    return {
      situation: "RUNNING",
      region: getMockRegion(regionCode),
      targetDate: toDateString(new Date()),
      score: 98,
      summary:
        "오늘은 비 소식은 없지만 습도가 조금 높아요. 추천 시간대에 수분을 충분히 챙기며 달려보세요.",
      recommendedTimes: [
        { start: "08:00", end: "11:00" },
        { start: "19:00", end: "22:00" },
      ],
      uvIndex: { value: 6, grade: "HIGH", label: "높음" },
      overview: {
        precipitationProbability: 20.0,
        humidity: 80.0,
        feelsLike: 15.0,
        airQuality: {
          grade: "NORMAL",
          label: "보통",
          pm10: 35,
          pm25: 25,
          stationName: "중구",
        },
      },
    };
  }
  const { data } = await api.get("/api/situations/running/", {
    params: regionCode ? { regionCode } : undefined,
  });
  return data;
};
