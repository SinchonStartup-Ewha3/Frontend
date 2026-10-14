import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import MobileLayout from "../../components/MobileLayout";
import TimeWheelPicker from "../../components/TimeWheelPicker";

export default function WeatherFortuneBirthTimePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [time, setTime] = useState("01:06");

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
          정확한 시간을 모를 경우,
          <br />
          비슷한 시간을 선택해주세요
        </p>

        <section aria-label="태어난 시간" style={{ top: 367 }} className="absolute left-6 right-6">
          <h2 className="mb-[10px] text-[20px] font-semibold leading-[1.4] tracking-[-0.6px] text-[#1F1C1A]">
            생시
          </h2>
          <TimeWheelPicker value={time} onChange={setTime} />
        </section>

        <Button
          variant="primary"
          onClick={() =>
            navigate("/weather-fortune/loading", {
              state: {
                calendar: state?.calendar ?? "양력",
                date: state?.date ?? { year: 2004, month: 12, day: 6 },
                time: {
                  hour: Number(time.split(":")[0]),
                  minute: Number(time.split(":")[1]),
                },
              },
            })
          }
          className="absolute left-1/2 top-[696px] !h-[44px] !w-[345px] -translate-x-1/2 rounded-[10px] text-[18px] tracking-[-0.18px]"
        >
          완료
        </Button>

        <Button
          variant="ghost"
          onClick={() =>
            navigate("/weather-fortune/birth-info", {
              state: {
                calendar: state?.calendar ?? "양력",
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
