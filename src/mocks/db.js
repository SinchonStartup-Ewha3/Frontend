// ─────────────────────────────────────────────────────────────
// mock DB : API 연결 전에 화면 동작을 확인하기 위한 가짜 서버 데이터용
// 추후 API 연결 후에 삭제 예정입니당!!!!
//  - 메모리 + localStorage 에 저장돼서 새로고침해도 유지되도록 만들었어요
//  - 초기화: 브라우저 콘솔에서 `weeMock.reset()`
//  - 프리미엄 on/off 테스트: `weeMock.setPremium(true | false)`
// ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "wee:mock-db:v1";
const hoursAgo = (h) => new Date(Date.now() - h * 3600_000).toISOString();

const createSeed = () => ({
  user: {
    id: "likelion@daum.net", // 카카오톡 가입 아이디(이메일)
    nickname: "김멋사",
    region: "서울특별시 서대문구",
    profileImage: null,
  },
  // 프리미엄(맞춤형 행동 알림 구독)
  subscription: {
    active: true,
    planName: "맞춤형 행동 알림",
    paidAt: "2026.09.27",
    transactionId: "mock_txn_001",
  },
  // 날씨 운세 이용권
  fortunePass: {
    packageName: "21 days Package",
    lastPaidAt: "2026.09.27",
  },
  // 알림 종류별 ON/OFF
  alarmSettings: {
    outer: true,
    exercise: false,
    laundry: true,
    umbrella: true,
  },
  // 알림 일정 (우산 챙기세요 -> 내 알림 일정)
  schedules: [
    {
      id: "sch_1",
      type: "umbrella",
      name: "학원 갈 때",
      days: ["월", "금"],
      time: "18:00",
      region: "서울 성북구 안암동",
      leadMinutes: 60,
    },
    {
      id: "sch_2",
      type: "umbrella",
      name: "학원 갈 때",
      days: ["수", "목"],
      time: "18:00",
      region: "서울 성북구 안암동",
      leadMinutes: 60,
    },
  ],
  // 내가 쓴 글
  myPosts: [
    {
      id: "my_1",
      message:
        "가디건만 입고 나왔다가 후회했어요 지금 나가시는 분들은 코트 챙기세요",
      likes: 20,
      scraps: 20,
      region: "서울 서대문구",
      createdAt: hoursAgo(1),
      image: null,
    },
    {
      id: "my_2",
      message:
        "가디건만 입고 나왔다가 후회했어요 지금 나가시는 분들은 패딩 챙기세요",
      likes: 0,
      scraps: 0,
      region: "서울 서대문구",
      createdAt: hoursAgo(1),
      image: null,
    },
    {
      id: "my_3",
      message:
        "가디건만 입고 나왔다가 후회했어요 지금 나가시는 분들은 바람막이 챙기세요",
      likes: 0,
      scraps: 0,
      region: "서울 서대문구",
      createdAt: hoursAgo(1),
      image: null,
    },
  ],
  // 저장(북마크)한 글 — 다른 사람 글
  savedPosts: [
    {
      id: "sv_1",
      message:
        "가디건만 입고 나왔다가 후회했어요 지금 나가시는 분들은 코트 챙기세요",
      likes: 20,
      region: "서울 서대문구",
      createdAt: hoursAgo(1),
    },
    {
      id: "sv_2",
      message:
        "가디건만 입고 나왔다가 후회했어요 지금 나가시는 분들은 패딩 챙기세요",
      likes: 0,
      region: "서울 서대문구",
      createdAt: hoursAgo(1),
    },
    {
      id: "sv_3",
      message:
        "가디건만 입고 나왔다가 후회했어요 지금 나가시는 분들은 바람막이 챙기세요",
      likes: 0,
      region: "서울 서대문구",
      createdAt: hoursAgo(1),
    },
  ],
  refundRequests: [],
  surveyAnswers: null,
});

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : createSeed();
  } catch {
    return createSeed();
  }
};

export const db = load();

// 변경 후 호출하면 localStorage 에 저장
export const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* 저장 공간 부족 등은 무시 (mock 이라서) */
  }
};

// 서버 응답처럼 느껴지도록 약간의 지연
export const delay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// 개발 중 콘솔에서 쓰는 도구
if (import.meta.env.DEV && typeof window !== "undefined") {
  window.weeMock = {
    reset: () => {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    },
    setPremium: (active) => {
      db.subscription.active = Boolean(active);
      persist();
      location.reload();
    },
  };
}
