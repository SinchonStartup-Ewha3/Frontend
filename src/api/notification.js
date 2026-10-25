// 알림 관련 api...
// TODO 주석은 나중에 api 연결 시 수정해야 하는 부분들 표시해둔 거라서!! 신경 안 쓰셔도 됩니당 !!

import api from "./axios";
import { USE_MOCK } from "./config";
import { db, delay, persist } from "../mocks/db";
import { searchRegions } from "./location";

const DAY_TO_NUMBER = { 월: 0, 화: 1, 수: 2, 목: 3, 금: 4, 토: 5, 일: 6 };
const PURPOSE_BY_NAME = [
  [/학원/, "ACADEMY"],
  [/출근/, "COMMUTE"],
  [/등교|학교/, "SCHOOL"],
  [/알바/, "PART_TIME"],
  [/운동/, "EXERCISE"],
];

const toScheduleModel = (schedule) => ({
  ...schedule,
  id: schedule.id ?? schedule.scheduleId,
  days: schedule.days ?? (schedule.weekdays ?? []).map((day) => Object.keys(DAY_TO_NUMBER).find((label) => DAY_TO_NUMBER[label] === day)),
  time: schedule.time ?? schedule.outingTime,
  region: schedule.region ?? schedule.regionName,
});

const toCreateSchedulePayload = async (schedule) => {
  let regionCode = schedule.regionCode ?? schedule.region?.regionCode;
  if (!regionCode) {
    const regionName = typeof schedule.region === "string" ? schedule.region : schedule.region?.regionName;
    if (regionName) {
      const matches = await searchRegions(regionName);
      const match = matches.find((item) => item.regionName === regionName || item.shortName === regionName) ?? matches[0];
      regionCode = match?.regionCode;
    }
  }
  const purpose = schedule.purpose ?? PURPOSE_BY_NAME.find(([pattern]) => pattern.test(schedule.name))?.[1] ?? "CUSTOM";
  const weekdays = schedule.weekdays ?? (schedule.days ?? []).map((day) => typeof day === "number" ? day : DAY_TO_NUMBER[day]);
  const payload = {
    name: schedule.name?.trim(),
    purpose,
    weekdays: [...new Set(weekdays)].filter((day) => Number.isInteger(day)).sort((a, b) => a - b),
    outingTime: schedule.outingTime ?? schedule.time,
    regionCode,
    leadMinutes: schedule.leadMinutes,
  };
  if (!payload.regionCode) throw new Error("지역을 검색해 선택해 주세요.");
  return payload;
};

const ALARM_SETTING_FIELDS = {
  outer: "outerwearEnabled",
  exercise: "exerciseEnabled",
  laundry: "laundryEnabled",
};

const toAlarmSettingsModel = (settings = {}) => ({
  outer: Boolean(settings.outerwearEnabled ?? settings.outer),
  exercise: Boolean(settings.exerciseEnabled ?? settings.exercise),
  laundry: Boolean(settings.laundryEnabled ?? settings.laundry),
  umbrella: Boolean(db.alarmSettings.umbrella),
});

const toAlarmSettingsPayload = (settings) =>
  Object.fromEntries(
    Object.entries(settings)
      .filter(([key]) => key in ALARM_SETTING_FIELDS || Object.values(ALARM_SETTING_FIELDS).includes(key))
      .map(([key, value]) => [ALARM_SETTING_FIELDS[key] ?? key, value]),
  );

// 프리미엄 맞춤 알림 ON/OFF 설정
export const fetchAlarmSettings = async () => {
  if (USE_MOCK) {
    await delay(200);
    return { ...db.alarmSettings };
  }
  const { data } = await api.get("/api/premium/notification-settings/");
  return toAlarmSettingsModel(data);
};

// 전체 프리미엄 맞춤 알림 설정 저장
export const updateAlarmSettings = async (payload) => {
  if (USE_MOCK) {
    await delay(200);
    db.alarmSettings = { ...db.alarmSettings, ...payload };
    persist();
    return { ...db.alarmSettings };
  }
  const { data } = await api.put(
    "/api/premium/notification-settings/",
    toAlarmSettingsPayload(payload),
  );
  return toAlarmSettingsModel(data);
};

// 변경된 프리미엄 맞춤 알림 설정만 저장
export const patchAlarmSettings = async (payload) => {
  if (USE_MOCK) {
    await delay(200);
    db.alarmSettings = { ...db.alarmSettings, ...payload };
    persist();
    return { ...db.alarmSettings };
  }
  const { data } = await api.patch(
    "/api/premium/notification-settings/",
    toAlarmSettingsPayload(payload),
  );
  return toAlarmSettingsModel(data);
};

// 알림 일정 (우산 챙기세요 -> 내 알림 일정)
export const fetchSchedules = async (type) => {
  if (USE_MOCK) {
    await delay(200);
    return db.schedules.filter((s) => s.type === type);
  }
  const { data } = await api.get("/api/situations/schedules/");
  const schedules = Array.isArray(data) ? data : data.schedules ?? data.results ?? [];
  return schedules
    .map(toScheduleModel)
    .sort((first, second) =>
      String(first.time ?? "").localeCompare(String(second.time ?? "")) ||
      Number(first.id ?? 0) - Number(second.id ?? 0),
    );
};

// 외출 알림 일정 단건 조회 (수정 화면 초기값)
export const fetchSchedule = async (scheduleId) => {
  if (USE_MOCK) {
    await delay(200);
    const schedule = db.schedules.find(
      (item) => String(item.scheduleId ?? item.id) === String(scheduleId),
    );
    if (!schedule) {
      const error = new Error("일정을 찾을 수 없습니다.");
      error.response = { status: 404 };
      throw error;
    }
    return toScheduleModel(schedule);
  }
  const { data } = await api.get(`/api/situations/schedules/${scheduleId}/`);
  return toScheduleModel(data);
};

// schedule 예) { type, name, days:["월","금"], time:"18:00", region, leadMinutes:60 }
export const createSchedule = async (schedule) => {
  const payload = await toCreateSchedulePayload(schedule);
  if (USE_MOCK) {
    await delay();
    const created = toScheduleModel({
      ...payload,
      scheduleId: `sch_${Date.now()}`,
      regionName: typeof schedule.region === "string" ? schedule.region : schedule.region?.regionName,
    });
    db.schedules.push(created);
    persist();
    return created;
  }
  const { data } = await api.post("/api/situations/schedules/", payload);
  return toScheduleModel(data);
};

export const deleteSchedule = async (id) => {
  if (USE_MOCK) {
    await delay(200);
    db.schedules = db.schedules.filter((s) => s.id !== id);
    persist();
    return { ok: true };
  }
  await api.delete(`/api/situations/schedules/${id}/`);
  // DELETE returns 204 No Content; there is no response body to parse.
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
