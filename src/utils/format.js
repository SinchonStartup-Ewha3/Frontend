// 이런저런 format setting용 유틸들...~

// "18:00" -> "오후 6:00"
export const formatTimeKo = (hhmm = "18:00") => {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "오후" : "오전";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${hour12}:${String(m).padStart(2, "0")}`;
};

// 외출 시간("18:00") - 몇 분 전(60) -> "오후 5시" / "오후 5시 30분"
export const formatAlarmTime = (hhmm, leadMinutes) => {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (((h * 60 + m - leadMinutes) % 1440) + 1440) % 1440;
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  const period = hh >= 12 ? "오후" : "오전";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return mm === 0 ? `${period} ${hour12}시` : `${period} ${hour12}시 ${mm}분`;
};

// ["월","금"] -> "월, 금"
export const formatDays = (days = []) => days.join(", ");

// "서울특별시 성북구 안암동" -> "안암동" (마지막 단어)
export const lastRegionWord = (region = "") =>
  region.trim().split(/\s+/).pop() ?? "";

// ISO 문자열 -> "9/27"
export const formatMonthDay = (iso) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

// ISO 문자열 -> "방금 전 / 1시간 전 / 3일 전"
export const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  return `${Math.floor(hour / 24)}일 전`;
};

// 계좌/전화번호 입력에서 숫자만 남기기
export const onlyDigits = (value = "") => value.replace(/\D/g, "");
