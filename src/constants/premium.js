// 프리미엄 구독 관련 상수 모음 ~.~

// 프리미엄 온보딩 진행 바
export const ONBOARDING_PROGRESS = [20, 40, 60, 80, 100];

// 설문 진행 바
export const SURVEY_PROGRESS = [20, 40, 60, 80, 80];

// 구독 상품 (Paddle priceId는 .env 로 넣기)
export const PREMIUM_PLAN = {
  name: "Wee 구독",
  priceLabel: "3,000₩",
  periodLabel: "3 weeks 구독권",
  description: "Wee 구독으로\n맞춤형 행동 알림을 받아보세요.",
  priceId: import.meta.env.VITE_PADDLE_PRICE_PREMIUM ?? "",
};

// 날씨 운세 이용권 패키지 추가 구매용(일단 남겨놓음)
export const FORTUNE_PACKAGE = {
  name: "21 days Package",
  priceId: import.meta.env.VITE_PADDLE_PRICE_FORTUNE ?? "",
};

// 설문 Q1~Q3 (단일 선택)
// key: 서버에 보낼 답변 키 / options: 선택지
export const SURVEY_QUESTIONS = [
  {
    key: "cold",
    title: "추위를 얼마나 타시나요?",
    desc: "기온 변화가 큰 날,\n겉옷 알림을 더 정확하게 보내드릴게요",
    options: [
      "추위를 많이 타요",
      "보통이에요",
      "더위를 더 잘 느껴요",
      "잘 모르겠어요",
    ],
  },
  {
    key: "exerciseTime",
    title: "주로 운동은\n언제 하시나요?",
    desc: "운동하기 좋은 시간 알림을\n더 잘 보내드릴게요",
    options: [
      "아침에 자주 해요",
      "저녁에 자주 해요",
      "날씨 좋을 때만 해요",
      "운동 알림은 필요 없어요",
    ],
  },
  {
    key: "laundry",
    title: "빨래 알림이 필요하신가요?",
    desc: "비나 습도 변화에 맞춰\n빨래 관련 알림을 보내드릴게요",
    options: [
      "비 오기 전에 알려주세요",
      "습도가 높을 때 알려주세요",
      "실내 건조 팁도 받고싶어요",
      "빨래 알림은 필요 없음",
    ],
  },
];

// 일정 이름 추천 칩
export const SCHEDULE_NAME_CHIPS = ["출근", "등교", "알바", "운동"];

// 요일 (index 0=월 ~ 6=일)
export const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

// 알림 시점 (외출 시간 기준 몇 분 전) — value 는 분 단위
export const LEAD_OPTIONS = [
  { label: "2시간 전", value: 120 },
  { label: "1시간 전", value: 60 },
  { label: "30분 전", value: 30 },
  { label: "10분 전", value: 10 },
];
