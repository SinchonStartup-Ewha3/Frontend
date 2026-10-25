// 상황별 정보(수분 / 빨래 / 러닝) 화면에서 같이 쓰는 작은 유틸 함수들

const pad = (value) => String(value).padStart(2, "0");

// Date -> "2026-10-10" (브라우저의 현지 시간 기준)
export const toDateString = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// 서버가 준 targetDate 가 오늘보다 뒤면 "내일", 아니면 "오늘"
// (낮이 지난 저녁에 조회하면 서버가 내일 기준으로 내려주도록 했어요!!)
export const getDayLabel = (targetDate) =>
  targetDate && targetDate > toDateString(new Date()) ? "내일" : "오늘";

// { start: "12:00", end: "15:00" } -> "12:00 - 15:00"
export const formatTimeRange = (range) =>
  range?.start && range?.end ? `${range.start} - ${range.end}` : "";

// 20 -> "20%" / 값이 없으면 "-"
export const formatPercent = (value) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "-";
  }
  return `${Math.round(Number(value))}%`;
};

// 15.4 -> "15°" / 값이 없으면 "-"
export const formatTemperature = (value) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "-";
  }
  return `${Math.round(Number(value))}°`;
};

// 서버 에러 값이 ["문구"] 배열이면 첫 번째 문구만, 문자열이면 그대로
const pickText = (value) => (Array.isArray(value) ? value[0] : value);

// axios 에러에서 서버가 내려준 문구를 꺼내고, 없으면 fallback 문구 사용

export const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  const serverMessage = [
    data?.message,
    data?.detail,
    data?.regionCode,
    data?.location,
  ]
    .map(pickText)
    .find((text) => typeof text === "string" && text);
  return serverMessage ?? fallback;
};
