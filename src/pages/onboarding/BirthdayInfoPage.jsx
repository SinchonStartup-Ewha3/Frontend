import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import useOnboardingStore from "../../store/useOnboardingStore";

const pad = (value) => String(value).padStart(2, "0");

function PickerWheel({ values, value, onChange, label, className = "" }) {
  const wheelRef = useRef(null);
  const timeoutRef = useRef(null);
  const items = useMemo(() => Array.from({ length: 5 }, () => values).flat(), [values]);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return undefined;
    const initialIndex = values.indexOf(value) + values.length * 2;
    requestAnimationFrame(() => {
      wheel.scrollTop = initialIndex * 45 - 45;
    });
    return () => window.clearTimeout(timeoutRef.current);
  }, [values, value]);

  const handleScroll = () => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    const centerIndex = Math.round((wheel.scrollTop + wheel.clientHeight / 2) / 45);
    const selectedValue = items[centerIndex];
    if (selectedValue === undefined) return;
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => onChange(selectedValue), 80);
  };

  return (
    <div
      ref={wheelRef}
      role="listbox"
      aria-label={label}
      onScroll={handleScroll}
      className={`absolute top-[143px] h-[135px] w-[70px] snap-y snap-mandatory overflow-y-auto overscroll-contain text-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      style={{ scrollbarWidth: "none" }}
    >
      {items.map((item, index) => (
        <button
          key={`${index}-${item}`}
          type="button"
          role="option"
          aria-selected={item === value && index === values.indexOf(value) + values.length * 2}
          onClick={() => {
            const wheel = wheelRef.current;
            const targetIndex = values.indexOf(item) + values.length * 2;
            wheel?.scrollTo({ top: targetIndex * 45 - 45, behavior: "smooth" });
            onChange(item);
          }}
          className={`relative z-10 flex h-[45px] w-full snap-center items-center justify-center text-[16px] leading-[1.5] ${index === values.indexOf(value) + values.length * 2 ? "font-medium text-white" : "text-[#797776]"}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function formatBirthDate(date) {
  const [year, month, day] = date.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

export default function BirthdayInfoPage() {
  const navigate = useNavigate();
  const birthDate = useOnboardingStore((state) => state.birthDate);
  const setBirthDate = useOnboardingStore((state) => state.setBirthDate);
  const calendarType = useOnboardingStore((state) => state.calendarType);
  const setCalendarType = useOnboardingStore((state) => state.setCalendarType);
  const birthTime = useOnboardingStore((state) => state.birthTime);
  const setBirthTime = useOnboardingStore((state) => state.setBirthTime);
  const birthTimeUnknown = useOnboardingStore((state) => state.birthTimeUnknown);
  const setBirthTimeUnknown = useOnboardingStore((state) => state.setBirthTimeUnknown);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(() => new Date(`${birthDate}T12:00:00`));

  const [hour24, minute] = birthTime.split(":").map(Number);
  const selectedHour = hour24;

  const displayTime = useMemo(() => {
    const [hour, minutes] = birthTime.split(":").map(Number);
    return `${pad(hour)}:${pad(minutes)}`;
  }, [birthTime]);

  const setDialHour = (hour12) => {
    setBirthTime(`${pad(hour12)}:${pad(minute)}`);
  };

  const setDialMinute = (next) => setBirthTime(`${pad(hour24)}:${pad(next)}`);

  const moveCalendarMonth = (monthDelta) => {
    setCalendarViewDate((current) => new Date(current.getFullYear(), current.getMonth() + monthDelta, 1, 12));
  };
  const selectCalendarDay = (day) => {
    setBirthDate(`${calendarViewDate.getFullYear()}-${pad(calendarViewDate.getMonth() + 1)}-${pad(day)}`);
    setIsCalendarOpen(false);
  };
  const calendarDays = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 0).getDate();
  const calendarStartDay = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), 1).getDay();

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[390px] overflow-hidden bg-white text-[#353331] min-[402px]:left-1/2 min-[402px]:w-[402px] min-[402px]:max-w-none min-[402px]:-translate-x-1/2">
        <div className="absolute left-[24px] right-[24px] top-[24px] z-10">
          <Header back onLeft={() => navigate("/nickname")} />
        </div>

        <h1 className="absolute left-[24px] right-[24px] top-[125px] text-[30px] font-semibold leading-[1.4] tracking-[-0.9px]">
          생일을 알려주시면<br />날씨 운세를 봐드릴게요
        </h1>

        <section className="absolute left-[24px] right-[24px] top-[232px]" aria-labelledby="calendar-type-label">
          <h2 id="calendar-type-label" className="text-[20px] font-semibold leading-[1.38] tracking-[-0.6px]">양력, 음력</h2>
          <div className="mt-[14px] flex gap-[7px]">
            {[
              ["solar", "양력", "w-[81px]"],
              ["lunar", "음력 평달", "w-[107px]"],
              ["leap", "음력 윤달", "w-[107px]"],
            ].map(([value, label, width]) => (
              <button
                key={value}
                type="button"
                aria-pressed={calendarType === value}
                onClick={() => setCalendarType(value)}
                className={`h-[46px] ${width} shrink-0 rounded-[15px] border-2 bg-white text-[14px] font-semibold tracking-[-0.14px] ${calendarType === value ? "border-[#60E1FF] text-[#60E1FF]" : "border-[#E9E8E8] text-[#D2D2D1]"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="absolute left-[24px] right-[24px] top-[353px]" aria-labelledby="birth-date-label">
          <h2 id="birth-date-label" className="text-[20px] font-semibold leading-[1.38] tracking-[-0.6px]">생년월일</h2>
          <button
            type="button"
            onClick={() => {
              setCalendarViewDate(new Date(`${birthDate}T12:00:00`));
              setIsCalendarOpen(true);
            }}
            aria-label="생년월일 달력 열기"
            className="mt-[11px] flex h-[52px] w-[345px] items-center rounded-[15px] border-2 border-[#E9E8E8] px-[22px] text-left"
          >
            <span className="text-[16px] font-medium leading-[1.5] tracking-[-0.16px]">{formatBirthDate(birthDate)}</span>
            <svg className="ml-auto h-[20px] w-[20px] text-[#A5A4A3]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="6" width="16" height="15" rx="1" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8 3v5M16 3v5M4 10h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </section>

        <section className="absolute left-[24px] right-[24px] top-[488px]" aria-labelledby="birth-time-label">
          <h2 id="birth-time-label" className="text-[20px] font-semibold leading-[1.38] tracking-[-0.6px]">태어난 시간</h2>
          <button
            type="button"
            disabled={birthTimeUnknown}
            onClick={() => setIsTimePickerOpen(true)}
            className="relative mt-[11px] flex h-[52px] w-[345px] items-center rounded-[15px] border-2 border-[#E9E8E8] px-[22px] text-left text-[16px] font-medium leading-[1.5] tracking-[-0.16px] disabled:text-[#BCBBBA]"
          >
            <span>{displayTime}</span>
            <svg className="ml-auto h-[20px] w-[20px] text-[#D2D2D1]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <label className="mt-[13px] flex w-fit cursor-pointer items-center gap-[7px] text-[14px] font-medium leading-[1.5] tracking-[-0.42px] text-[#BCBBBA]">
            <input
              type="checkbox"
              checked={birthTimeUnknown}
              onChange={(event) => setBirthTimeUnknown(event.target.checked)}
              className="h-[19px] w-[19px] appearance-none border border-[#D2D2D1] checked:border-[#60E1FF] checked:bg-[#60E1FF]"
            />
            태어난 시간을 몰라요
          </label>
        </section>

        <div className="absolute left-[24px] top-[696px] w-[345px]">
          <Button variant="primary" onClick={() => navigate("/location-setup")} className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]">
            다음
          </Button>
        </div>

        {isTimePickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsTimePickerOpen(false);
          }}>
            <section role="dialog" aria-modal="true" aria-labelledby="time-picker-title" className="relative h-[360px] w-full max-w-[402px] rounded-[20px] bg-white">
              <h2 id="time-picker-title" className="absolute left-[35px] top-[25px] text-[16px] font-medium leading-[1.5]">생년월일</h2>
              <button type="button" onClick={() => setIsTimePickerOpen(false)} aria-label="시간 선택 닫기" className="absolute right-[36px] top-[25px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#D2D2D1] text-[#353331]">
                <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" aria-hidden="true">
                  <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <div className="absolute left-[111px] right-[105px] top-[92px] grid grid-cols-2 text-center text-[18px] font-medium leading-[1.5]">
                <span>시간</span><span>분</span>
              </div>
              <div className="absolute left-[80px] right-[77px] top-[193px] h-[35px] rounded-[5px] bg-[#60E1FF]" />
              <PickerWheel
                label="태어난 시간"
                values={Array.from({ length: 24 }, (_, index) => index)}
                value={selectedHour}
                onChange={setDialHour}
                className="left-[123px]"
              />
              <PickerWheel
                label="태어난 분"
                values={Array.from({ length: 60 }, (_, index) => index)}
                value={minute}
                onChange={setDialMinute}
                className="left-[216px]"
              />
            </section>
          </div>
        )}

        {isCalendarOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsCalendarOpen(false);
          }}>
            <section role="dialog" aria-modal="true" aria-labelledby="calendar-title" className="w-[345px] rounded-[20px] bg-white px-[24px] pb-[24px] pt-[22px] shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <div className="flex items-center justify-between">
                <h2 id="calendar-title" className="text-[18px] font-semibold text-[#252525]">생년월일 선택</h2>
                <button type="button" onClick={() => setIsCalendarOpen(false)} aria-label="달력 닫기" className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#E9E8E8] text-[#62605F]">
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                </button>
              </div>
              <div className="mt-[22px] flex items-center justify-between">
                <button type="button" onClick={() => moveCalendarMonth(-1)} aria-label="이전 달" className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-[24px] text-[#62605F]">‹</button>
                <p className="text-[16px] font-semibold text-[#353331]">{calendarViewDate.getFullYear()}년 {calendarViewDate.getMonth() + 1}월</p>
                <button type="button" onClick={() => moveCalendarMonth(1)} aria-label="다음 달" className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-[24px] text-[#62605F]">›</button>
              </div>
              <div className="mt-[12px] grid grid-cols-7 text-center text-[13px] font-medium text-[#8F8E8D]">
                {["일", "월", "화", "수", "목", "금", "토"].map((weekday) => <span key={weekday} className="py-[8px]">{weekday}</span>)}
              </div>
              <div className="grid grid-cols-7 text-center text-[14px]">
                {Array.from({ length: calendarStartDay }, (_, index) => <span key={`blank-${index}`} />)}
                {Array.from({ length: calendarDays }, (_, index) => {
                  const day = index + 1;
                  const selected = birthDate === `${calendarViewDate.getFullYear()}-${pad(calendarViewDate.getMonth() + 1)}-${pad(day)}`;
                  return (
                    <button key={day} type="button" aria-pressed={selected} onClick={() => selectCalendarDay(day)} className={`mx-auto flex h-[36px] w-[36px] items-center justify-center rounded-full ${selected ? "bg-[#60E1FF] font-semibold text-white" : "text-[#353331] hover:bg-[#F4F4F4]"}`}>
                      {day}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
    </MobileLayout>
  );
}
