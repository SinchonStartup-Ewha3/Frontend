export const FORTUNE_CALENDARS = [
  { label: "양력", value: "SOLAR" },
  { label: "음력 평달", value: "LUNAR_NORMAL" },
  { label: "음력 윤달", value: "LUNAR_LEAP" },
];

export const FORTUNE_CALENDAR_SELECTIONS = [
  { label: "양력", value: "SOLAR" },
  { label: "음력", value: "LUNAR_NORMAL" },
];

// 하루권(1일 상품)의 기준 단가 계산용: duration_days === 1 인 상품의 가격을 사용
export const FORTUNE_FALLBACK_DAILY_PRICE = 990;

// 결제 상태별 안내 문구 (PENDING/PAID 는 화면에서 따로 처리)
export const FORTUNE_PAYMENT_FAIL_MESSAGES = {
  FAILED: "결제 요청에 실패했어요. 다시 시도해 주세요.",
  CANCELED: "결제가 취소되었어요.",
  REFUNDED: "승인 취소(환불)된 결제예요.",
};

// 환불 요청 상태 라벨
export const FORTUNE_REFUND_STATUS_LABELS = {
  REQUESTED: "환불 요청 접수",
  PROCESSING: "환불 처리 중",
  COMPLETED: "환불 완료",
  REJECTED: "환불 거절",
};

// 결제 수단 라벨
export const FORTUNE_PAYMENT_METHOD_LABELS = {
  PAYAPP: "PayApp 결제",
  COUPON: "쿠폰 등록",
};

// 패키지 라벨: 7 -> "1 week Package", 14 -> "2 weeks Package", 그 외 -> "N days Package"
export const getFortunePackageLabel = (days) => {
  if (days > 0 && days % 7 === 0) {
    const weeks = days / 7;
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} Package`;
  }
  return `${days} ${days === 1 ? "day" : "days"} Package`;
};

export const formatWon = (value) =>
  `${Number(value ?? 0).toLocaleString("ko-KR")}`;

// "2026-10-30" -> "2026.10.30"
export const formatDotDate = (value) =>
  typeof value === "string" && value.length >= 10
    ? value.slice(0, 10).replaceAll("-", ".")
    : null;

// "2026-10-30" -> "2026년 10월 30일"
export const formatKoreanDate = (value) => {
  if (typeof value !== "string" || value.length < 10) return null;
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return `${y}년 ${m}월 ${d}일`;
};

// 환불 가능 조건 (API 명세): PAYAPP && can_request_refund === true
export const canRequestFortuneRefund = (pass) =>
  pass?.payment_method === "PAYAPP" && pass?.can_request_refund === true;
