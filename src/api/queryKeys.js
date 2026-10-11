// react-query 캐시 키 모음 (오타 방지 + invalidate 할 때 재사용)
const queryKeys = {
  profile: ["profile"],
  alarmSettings: ["alarm-settings"],
  schedules: (type) => ["alarm-schedules", type],
  subscription: ["subscription"],
  myPosts: ["posts", "mine"],
  myPost: (id) => ["posts", "mine", id],
  savedPosts: ["posts", "saved"],
  regions: (q) => ["regions", q],
};

export default queryKeys;
