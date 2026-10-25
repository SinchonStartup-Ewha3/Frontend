// react-query 캐시 키 모음 (오타 방지 + invalidate 할 때 재사용)
const queryKeys = {
  profile: ["profile"],
  myPageSummary: ["mypage", "summary"],
  alarmSettings: ["alarm-settings"],
  schedules: (type) => ["alarm-schedules", type],
  schedule: (scheduleId) => ["alarm-schedule", scheduleId],
  subscription: ["subscription"],
  premiumBilling: ["premium", "billing"],
  refundRequest: ["premium", "refund-request"],
  myPosts: ["posts", "mine"],
  myPostsPage: (page, pageSize) => ["posts", "mine", page, pageSize],
  myPost: (id) => ["posts", "mine", id],
  likedPosts: ["posts", "liked"],
  likedPostsPage: (page, pageSize) => ["posts", "liked", page, pageSize],
  regions: (q) => ["regions", q],
  hourlyWeather: ["home", "weather", "hourly"],
  currentWeather: ["home", "weather", "current"],
  todayFortune: ["fortune", "today"],
  fortunePurchases: ["fortune", "purchases", "me"],
  home: ["home"],
  hydration: ["situations", "hydration"],
  // 로그인 사용자는 저장된 위치("me"), 비로그인은 선택한 지역코드별로 캐시를 따로 두기...~
  laundry: (regionCode) => ["situations", "laundry", regionCode ?? "me"],
  running: (regionCode) => ["situations", "running", regionCode ?? "me"],
};

export default queryKeys;
