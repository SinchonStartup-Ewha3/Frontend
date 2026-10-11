// 알림 관련 api...
// TODO 주석은 나중에 api 연결 시 수정해야 하는 부분들 표시해둔 거라서!! 신경 안 쓰셔도 됩니당 !!

import api from "./axios";
import { USE_MOCK } from "./config";
import { db, delay, persist } from "../mocks/db";

// 알림 ON/OFF 설정
export const fetchAlarmSettings = async () => {
  if (USE_MOCK) {
    await delay(200);
    return { ...db.alarmSettings };
  }
  const { data } = await api.get("/notifications/settings"); // TODO(BE)
  return data;
};

// payload 예) { outer: true, umbrella: false }  (바뀐 것만 보내도 OK)
export const updateAlarmSettings = async (payload) => {
  if (USE_MOCK) {
    await delay(200);
    db.alarmSettings = { ...db.alarmSettings, ...payload };
    persist();
    return { ...db.alarmSettings };
  }
  const { data } = await api.patch("/notifications/settings", payload); // TODO(BE)
  return data;
};

// 알림 일정 (우산 챙기세요 -> 내 알림 일정)
export const fetchSchedules = async (type) => {
  if (USE_MOCK) {
    await delay(200);
    return db.schedules.filter((s) => s.type === type);
  }
  const { data } = await api.get("/notifications/schedules", {
    params: { type },
  }); // TODO(BE)
  return data;
};

// schedule 예) { type, name, days:["월","금"], time:"18:00", region, leadMinutes:60 }
export const createSchedule = async (schedule) => {
  if (USE_MOCK) {
    await delay();
    const created = { ...schedule, id: `sch_${Date.now()}` };
    db.schedules.push(created);
    persist();
    return created;
  }
  const { data } = await api.post("/notifications/schedules", schedule); // TODO(BE)
  return data;
};

export const deleteSchedule = async (id) => {
  if (USE_MOCK) {
    await delay(200);
    db.schedules = db.schedules.filter((s) => s.id !== id);
    persist();
    return { ok: true };
  }
  await api.delete(`/notifications/schedules/${id}`); // TODO(BE)
  return { ok: true };
};

// 푸시 구독 정보(PushSubscription JSON)를 서버에 저장 -> 서버가 web-push 로 발송
export const savePushSubscription = async (subscription) => {
  if (USE_MOCK) {
    await delay(100);
    localStorage.setItem("wee:mock-push-sub", JSON.stringify(subscription));
    return { ok: true };
  }
  await api.post("/notifications/push-subscriptions", subscription); // TODO(BE)
  return { ok: true };
};

export const removePushSubscription = async (endpoint) => {
  if (USE_MOCK) {
    localStorage.removeItem("wee:mock-push-sub");
    return { ok: true };
  }
  await api.delete("/notifications/push-subscriptions", { data: { endpoint } }); // TODO(BE)
  return { ok: true };
};
