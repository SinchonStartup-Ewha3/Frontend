import { useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import MobileLayout from "../../components/MobileLayout";

const initialDate = { year: 2004, month: 12, day: 6 };
const yearOptions = Array.from({ length: 127 }, (_, index) => 1900 + index);
const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);
const dateColumns = [
  { key: "year", label: "년", position: 20 },
  { key: "month", label: "월", position: 51 },
  { key: "day", label: "일", position: 79 },
];

function DateWheel({ column, value, values, onChange }) {
  const wheelRef = useRef(null);

  useLayoutEffect(() => {
    const selectedIndex = values.indexOf(value);
    if (wheelRef.current && selectedIndex >= 0) {
      wheelRef.current.scrollTop = selectedIndex * 44;
    }
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 86,
        left: `${column.position}%`,
        width: "29%",
        height: 132,
        transform: "translateX(-50%)",
      }}
    >
      <p
        style={{ top: -55 }}
        className="absolute inset-x-0 text-center text-[18px] font-medium leading-[1.4] text-[#1F1C1A]"
      >
        {column.label}
      </p>
      <div
        ref={wheelRef}
        role="listbox"
        aria-label={`${column.label} 선택`}
        aria-activedescendant={`${column.key}-${value}`}
        onScroll={(event) => {
          const nextIndex = Math.max(
            0,
            Math.min(values.length - 1, Math.round(event.currentTarget.scrollTop / 44)),
          );
          if (values[nextIndex] !== value) onChange(values[nextIndex]);
        }}
        style={{ height: 132, scrollSnapType: "y mandatory", scrollbarWidth: "none" }}
        className="overflow-y-auto overscroll-contain"
      >
        <div aria-hidden="true" style={{ height: 44 }} />
        {values.map((item) => (
          <button
            id={`${column.key}-${item}`}
            key={item}
            type="button"
            role="option"
            aria-selected={item === value}
            onClick={() => {
              if (wheelRef.current) wheelRef.current.scrollTop = values.indexOf(item) * 44;
              onChange(item);
            }}
            style={{ height: 44, scrollSnapAlign: "start" }}
            className={`block w-full shrink-0 text-center text-[16px] leading-[44px] ${
              item === value
                ? "font-medium text-[#353331]"
                : "font-normal text-[#1F1C1A]/60"
            }`}
          >
            {item}
          </button>
        ))}
        <div aria-hidden="true" style={{ height: 44 }} />
      </div>
    </div>
  );
}

export default function WeatherFortuneBirthInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [calendar, setCalendar] = useState(location.state?.calendar ?? "양력");
  const [date, setDate] = useState(initialDate);
  const daysInMonth = new Date(date.year, date.month, 0).getDate();
  const wheelColumns = dateColumns.map((column) => ({
    ...column,
    values:
      column.key === "year"
        ? yearOptions
        : column.key === "month"
          ? monthOptions
          : Array.from({ length: daysInMonth }, (_, index) => index + 1),
  }));

  const updateDatePart = (key, value) => {
    setDate((current) => {
      const next = { ...current, [key]: value };
      const lastDay = new Date(next.year, next.month, 0).getDate();
      if (next.day > lastDay) next.day = lastDay;
      return next;
    });
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[390px] overflow-hidden bg-white text-[#353331]">
        <h1 className="absolute left-6 right-6 top-[125px] text-[30px] font-semibold leading-[1.4] tracking-[-0.9px]">
          생일을 알려주시면
          <br />
          날씨 운세를 봐드릴게요
        </h1>

        <p
          style={{ top: 215 }}
          className="absolute left-6 right-6 whitespace-nowrap text-[18px] font-medium leading-[1.38] tracking-[-0.54px] text-[#D2D2D1]"
        >
          태어난 날짜를 선택해주세요
        </p>

        <div
          role="group"
          aria-label="달력 종류"
          style={{ top: 284 }}
          className="absolute left-6 right-6 flex h-[44px] rounded-[10px] bg-[#F4F4F4] p-0"
        >
          {[
            { label: "양력", value: "양력" },
            { label: "음력", value: "음력" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={calendar === option.value}
              onClick={() => setCalendar(option.value)}
              className={`h-[44px] flex-1 rounded-[10px] border text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] ${
                calendar === option.value
                  ? "border-main bg-[#E5FAFF] text-main"
                  : "border-transparent text-[#D2D2D1]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <section aria-label="생년월일" style={{ top: 367 }} className="absolute left-6 right-6">
          <h2 className="mb-[10px] text-[20px] font-semibold leading-[1.4] tracking-[-0.6px] text-[#1F1C1A]">
            생년월일
          </h2>
          <div className="relative h-[234px] rounded-[20px] border border-[#D2D2D1] bg-white">
            <div
              aria-hidden="true"
              style={{ top: 135, height: 35 }}
              className="absolute left-[10px] right-[10px] rounded-[5px] bg-[#F4F4F4]"
            />
            {wheelColumns.map((column) => (
              <DateWheel
                key={column.key}
                column={column}
                value={date[column.key]}
                values={column.values}
                onChange={(value) => updateDatePart(column.key, value)}
              />
            ))}
          </div>
        </section>

        <Button
          variant="primary"
          onClick={() => navigate("/weather-fortune/birth-time", { state: { calendar, date } })}
          className="absolute left-1/2 top-[696px] !h-[44px] !w-[345px] -translate-x-1/2 rounded-[10px] text-[18px] tracking-[-0.18px]"
        >
          다음
        </Button>

        <Button
          variant="ghost"
          onClick={() => navigate("/weather-fortune/calendar", { state: { calendar } })}
          className="absolute left-1/2 top-[750px] !h-[44px] !w-[345px] -translate-x-1/2 rounded-[10px] text-[18px] tracking-[-0.18px]"
        >
          이전
        </Button>
      </main>
    </MobileLayout>
  );
}
