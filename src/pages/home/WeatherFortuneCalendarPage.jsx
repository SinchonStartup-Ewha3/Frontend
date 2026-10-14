import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import MobileLayout from "../../components/MobileLayout";

const calendarOptions = ["양력", "음력"];

export default function WeatherFortuneCalendarPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [calendar, setCalendar] = useState(location.state?.calendar ?? null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleNext = () => {
    if (!calendar) {
      setErrorMessage("양력 또는 음력을 선택해주세요.");
      return;
    }

    navigate("/weather-fortune/birth-info", { state: { calendar } });
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
          양력, 음력을 선택해주세요
        </p>

        <div
          role="group"
          aria-label="달력 종류 선택"
          className="absolute left-6 right-6 top-[283px] flex h-[44px] rounded-[10px] bg-[#F4F4F4]"
        >
          {calendarOptions.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={calendar === option}
              onClick={() => {
                setCalendar(option);
                setErrorMessage("");
              }}
              className={`flex-1 rounded-[10px] text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] ${
                calendar === option
                  ? "border border-main bg-[#E5FAFF] text-main"
                  : "text-[#D2D2D1]"
              }`}
            >
              {option}
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
