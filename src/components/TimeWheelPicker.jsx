import { useLayoutEffect, useRef } from "react";

function TimeWheel({ column, value, onChange }) {
  const wheelRef = useRef(null);
  const selectedIndex = column.values.indexOf(value);

  useLayoutEffect(() => {
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
        width: `${column.width ?? 28}%`,
        height: 132,
        transform: "translateX(-50%)",
      }}
    >
      <p
        style={{ top: -45 }}
        className="absolute inset-x-0 text-center text-[18px] font-medium leading-[1.4] text-[#1F1C1A]"
      >
        {column.label}
      </p>
      <div
        ref={wheelRef}
        role="listbox"
        aria-label={`${column.label} 선택`}
        aria-activedescendant={`${column.key}-${selectedIndex}`}
        onScroll={(event) => {
          const nextIndex = Math.max(
            0,
            Math.min(column.values.length - 1, Math.round(event.currentTarget.scrollTop / 44)),
          );
          if (nextIndex !== selectedIndex) onChange(column.values[nextIndex]);
        }}
        style={{ height: 132, scrollSnapType: "y mandatory", scrollbarWidth: "none" }}
        className="overflow-y-auto overscroll-contain"
      >
        <div aria-hidden="true" style={{ height: 44 }} />
        {column.values.map((item, index) => (
          <button
            id={`${column.key}-${index}`}
            key={item}
            type="button"
            role="option"
            aria-selected={item === value}
            onClick={() => {
              if (wheelRef.current) wheelRef.current.scrollTop = index * 44;
              onChange(item);
            }}
            style={{ height: 44, scrollSnapAlign: "start" }}
            className={`block w-full shrink-0 text-center text-[16px] leading-[44px] ${
              item === value ? "font-medium text-[#353331]" : "font-normal text-[#1F1C1A]/60"
            }`}
          >
            {column.format ? column.format(item) : item}
          </button>
        ))}
        <div aria-hidden="true" style={{ height: 44 }} />
      </div>
    </div>
  );
}

// value is an HH:mm string. When useAmPm is enabled, the dial shows 오전/오후 + 1–12시.
export default function TimeWheelPicker({ value = "18:00", onChange, useAmPm = false }) {
  const [rawHour, rawMinute] = value.split(":").map(Number);
  const hour24 = Number.isFinite(rawHour) ? rawHour : 18;
  const minute = Number.isFinite(rawMinute) ? rawMinute : 0;
  const period = hour24 < 12 ? "오전" : "오후";
  const hour12 = hour24 % 12 || 12;

  const updateHour = (nextHour) => {
    const next24 = useAmPm ? (nextHour % 12) + (period === "오후" ? 12 : 0) : nextHour;
    onChange(`${String(next24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  };

  const updateMinute = (nextMinute) => {
    onChange(`${String(hour24).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`);
  };

  const updatePeriod = (nextPeriod) => {
    const next24 = (hour12 % 12) + (nextPeriod === "오후" ? 12 : 0);
    onChange(`${String(next24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  };

  const columns = useAmPm
    ? [
        { key: "period", label: "오전/오후", position: 18, width: 35, values: ["오전", "오후"], value: period, onChange: updatePeriod },
        { key: "hour", label: "시", position: 51, width: 25, values: Array.from({ length: 12 }, (_, index) => index + 1), value: hour12, onChange: updateHour },
        { key: "minute", label: "분", position: 82, width: 25, values: Array.from({ length: 60 }, (_, index) => index), value: minute, onChange: updateMinute, format: (item) => String(item).padStart(2, "0") },
      ]
    : [
        { key: "hour", label: "시", position: 35, values: Array.from({ length: 24 }, (_, index) => index), value: hour24, onChange: updateHour },
        { key: "minute", label: "분", position: 63, values: Array.from({ length: 60 }, (_, index) => index), value: minute, onChange: updateMinute },
      ];

  return (
    <div className="relative h-[234px] rounded-[20px] border border-[#D2D2D1] bg-white">
      <div
        aria-hidden="true"
        style={{ top: 135, left: "50%", width: 245, height: 35, transform: "translateX(-50%)" }}
        className="absolute rounded-[5px] bg-[#F4F4F4]"
      />
      {columns.map((column) => (
        <TimeWheel
          key={column.key}
          column={column}
          value={column.value}
          onChange={column.onChange}
        />
      ))}
    </div>
  );
}
