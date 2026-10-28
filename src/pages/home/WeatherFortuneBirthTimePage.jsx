import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import MobileLayout from "../../components/MobileLayout";
import TimeWheelPicker from "../../components/TimeWheelPicker";

export default function WeatherFortuneBirthTimePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [time, setTime] = useState("01:06");
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (isSubmitting) return;
    const date = state?.date ?? { year: 2004, month: 12, day: 6 };
    const birthDate = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
    const [hour, minute] = time.split(":");
    const payload = {
      calendar_type: state?.calendarType ?? "SOLAR",
      birth_date: birthDate,
      birth_time_unknown: birthTimeUnknown,
      ...(birthTimeUnknown ? {} : { birth_time: `${hour}:${minute}` }),
    };

    setIsSubmitting(true);
    navigate("/weather-fortune/loading", { replace: true, state: { profilePayload: payload } });
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
          className="absolute left-6 right-6 text-[18px] font-medium leading-[1.38] tracking-[-0.54px] text-[#D2D2D1]"
        >
          정확한 시간을 모르면 ‘시간을 몰라요’를 선택해주세요.
          <br />
        </p>

        <section aria-label="태어난 시간" style={{ top: 356 }} className="absolute left-6 right-6">
          <div className="mb-[10px] flex min-h-[28px] items-center justify-between">
            <h2 className="text-[20px] font-semibold leading-[1.4] tracking-[-0.6px] text-[#1F1C1A]">
              생시
            </h2>
            <button
              type="button"
              aria-pressed={birthTimeUnknown}
              onClick={() => setBirthTimeUnknown((unknown) => !unknown)}
              className={`rounded-[8px] border px-3 py-1.5 text-[13px] font-semibold ${birthTimeUnknown ? "border-main bg-[#E5FAFF] text-main" : "border-[#E9E8E8] text-[#797776]"}`}
            >
              태어난 시간을 몰라요
            </button>
          </div>
          {birthTimeUnknown ? (
            <div className="flex h-[160px] items-center justify-center rounded-[20px] border border-[#D2D2D1] text-[16px] text-[#797776]">
              태어난 시간을 입력하지 않고 등록합니다.
            </div>
          ) : (
            <TimeWheelPicker value={time} onChange={setTime} />
          )}
        </section>

        <Button
          variant="primary"
          onClick={handleComplete}
          disabled={isSubmitting}
          className="absolute left-1/2 top-[696px] !h-[44px] !w-[345px] -translate-x-1/2 rounded-[10px] text-[18px] tracking-[-0.18px]"
        >
          {isSubmitting ? "등록 중..." : "완료"}
        </Button>

        <Button
          variant="ghost"
          onClick={() =>
            navigate("/weather-fortune/birth-info", {
              state: {
                calendarType: state?.calendarType ?? "SOLAR",
                date: state?.date ?? { year: 2004, month: 12, day: 6 },
              },
            })
          }
          className="absolute left-1/2 top-[750px] !h-[44px] !w-[345px] -translate-x-1/2 rounded-[10px] text-[18px] tracking-[-0.18px]"
        >
          이전
        </Button>
      </main>
    </MobileLayout>
  );
}
