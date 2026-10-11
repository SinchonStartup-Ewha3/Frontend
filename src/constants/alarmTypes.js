// 맞춤형 행동 알림 5종 문구 정리

export const ALARM_ORDER = ["outer", "exercise", "laundry", "umbrella"];

export const ALARM_TYPES = {
  outer: {
    id: "outer",
    title: "겉옷 챙기세요", // 알림 설정 / 온보딩 제목
    short: "겉옷 알림", // 마이페이지 토글 라벨
    sub: "기온 변화가 큰 날",
    inSettings: true, // 알림 설정 화면에 노출할지
    hasSchedule: false, // true면 설정 화면에서 토글 대신 ">" 로 상세(일정 목록) 이동
    question:
      "아침엔 분명 따뜻했는데, 오후엔 갑자기 쌀쌀해져서 당황한 적 있으셨나요?",
    reasons: [
      "아침저녁 기온차가 큰 환절기, 옷차림이 매번 고민될 때",
      "날씨가 갑자기 바뀌어서 당황하고 싶지 않을 때",
      "매번 날씨 앱을 직접 켜서 확인하기 귀찮을 때",
    ],
  },
  exercise: {
    id: "exercise",
    title: "운동하기 좋은 시간",
    short: "운동 알림",
    sub: "운동 날씨가 좋을 때",
    inSettings: true,
    hasSchedule: false,
    question:
      "운동하려고 마음먹었는데, 막상 날씨가 도와주지 않은 적 있으셨나요?",
    reasons: [
      "러닝이나 산책 나가기 전, 타이밍을 재고 싶을 때",
      "미세먼지 때문에 실외 운동을 망설이게 될 때",
      "하루 중 언제가 제일 쾌적한지 매번 검색하기 귀찮을 때",
    ],
  },
  laundry: {
    id: "laundry",
    title: "빨래 걷어두세요",
    short: "빨래 알림",
    sub: "비 예보가 있을 때",
    inSettings: true,
    hasSchedule: false,
    question:
      "맑아서 널어둔 빨래, 외출한 사이에 비가 와서 다시 젖어버린 적 있으셨나요?",
    reasons: [
      "맑은 날씨만 보고 빨래를 널었는데 갑자기 흐려질 때",
      "외출 중이라 하늘을 직접 확인하기 어려울 때",
      "빨래를 다시 세탁하는 번거로움을 피하고 싶을 때",
    ],
  },
  umbrella: {
    id: "umbrella",
    title: "우산 챙기세요",
    short: "우산 알림",
    sub: "비가 예상될 때",
    detailSub: "비가 예상될 때, 외출 전 미리 알려드려요", // 상세 화면 부제
    inSettings: true,
    hasSchedule: true, // GUI: 우산 행만 ">" 로 일정 상세 화면 이동 (다른 타입도 일정 기능 쓰면 true로 조정)
    question:
      "분명 아침엔 맑았는데, 나가고 나서야 비가 와서 당황한 적 있으셨나요?",
    reasons: [
      "아침엔 맑아서 우산 없이 나가려고 할 때",
      "갑작스러운 소나기로 낭패 보고 싶지 않을 때",
      "외출 전 날씨 앱을 매번 켜서 확인하기 번거로울 때",
    ],
  },
};

export const ALARM_LIST = ALARM_ORDER.map((id) => ALARM_TYPES[id]);
