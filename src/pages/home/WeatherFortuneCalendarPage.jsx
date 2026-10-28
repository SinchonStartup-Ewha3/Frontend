import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import MobileLayout from "../../components/MobileLayout";
import { FORTUNE_CALENDAR_SELECTIONS } from "../../constants/fortune";

export default function WeatherFortuneCalendarPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [calendarType, setCalendarType] = useState(location.state?.calendarType ?? null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleNext = () => {
    if (!calendarType) {
      setErrorMessage("달력 종류를 선택해주세요.");
      return;
    }

    navigate("/weather-fortune/birth-info", { state: { calendarType } });
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
          양력, 음력
        </p>

        <div
          role="group"
          aria-label="달력 종류 선택"
          className="absolute left-5 right-5 top-[268px] grid h-[42px] grid-cols-2 gap-0 rounded-[10px] bg-[#F4F4F4] p-0"
        >
          {FORTUNE_CALENDAR_SELECTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={calendarType === option.value}
              onClick={() => {
                setCalendarType(option.value);
                setErrorMessage("");
              }}
              className={`rounded-[10px] text-[14px] font-semibold leading-[1.4] tracking-[-0.18px] ${
                calendarType === option.value
                  ? "border border-main bg-[#E5FAFF] text-main"
                  : "text-[#D2D2D1]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {errorMessage && (
          <p className="absolute left-6 right-6 top-[342px] text-center text-sm text-red-500" role="alert">
            {errorMessage}
          </p>
        )}

        <Button
          variant="primary"
          onClick={handleNext}
          className="absolute left-1/2 top-[696px] !h-[44px] !w-[345px] -translate-x-1/2 rounded-[10px] text-[18px] tracking-[-0.18px]"
        >
          다음
        </Button>

      
      </main>
    </MobileLayout>
  );
}
