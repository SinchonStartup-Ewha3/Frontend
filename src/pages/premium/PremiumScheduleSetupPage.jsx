import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomCTA from "../../components/BottomCTA";
import Button from "../../components/Button";
import BottomSheet from "../../components/BottomSheet";
import InputField from "../../components/InputField";
import MobileLayout from "../../components/MobileLayout";
import PageHeading from "../../components/PageHeading";
import TimeWheelPicker from "../../components/TimeWheelPicker";
import { DAYS, SCHEDULE_NAME_CHIPS } from "../../constants/premium";
import { formatTimeKo } from "../../utils/format";

const INITIAL_FORM = {
  name: "학원 갈 때",
  days: ["월", "금"],
  time: "18:00",
};

export default function PremiumScheduleSetupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [draftTime, setDraftTime] = useState(INITIAL_FORM.time);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const toggleDay = (day) => {
    setForm((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((selected) => selected !== day)
        : [...current.days, day],
    }));
  };

  const handleNext = () => {
    if (!form.name.trim() || !form.days.length) {
      return;
    }
    navigate("/premium/schedule-alert-settings", { state: form });
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] overflow-hidden bg-white text-[#353331]">
        <div
          role="progressbar"
          aria-label="설문 진행률 80%"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={80}
          className="absolute h-[6px] rounded-full bg-[#E9E8E8]"
          style={{ top: 112, left: 24, right: 24 }}
        >
          <div className="h-full rounded-full bg-main" style={{ width: "80%" }} />
        </div>

        <PageHeading
          title="알림 일정 추가"
          size="lg"
          className="absolute"
          style={{ top: 164, left: 23, right: 23 }}
          titleClassName="!text-[26px] !leading-[1.3] !tracking-[-0.78px]"
        />

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleNext();
          }}
        >
          <label
            htmlFor="premium-schedule-name"
            className="absolute text-[18px] font-semibold leading-[1.38] tracking-[-0.54px] text-[#252525]"
            style={{ top: 225, left: 24 }}
          >
            이 일정을 뭐라고 부를까요?
          </label>
          <div className="absolute" style={{ top: 263, left: 24, right: 24 }}>
            <InputField
              id="premium-schedule-name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              maxLength={20}
              className="!h-[52px] !rounded-[15px] !border-2 !px-6 !pr-12 !text-[14px] !font-medium"
            />
            {form.name && (
              <button
                type="button"
                aria-label="일정 이름 지우기"
                onClick={() => setForm((current) => ({ ...current, name: "" }))}
                className="absolute right-[14px] top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-[18px] leading-none text-[#BCBBBA]"
              >
                ×
              </button>
            )}
          </div>

          <div
            className="absolute flex items-center"
            style={{ top: 327, left: 24, gap: 5 }}
          >
            {SCHEDULE_NAME_CHIPS.map((name) => {
              const selected = form.name === name;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setForm((current) => ({ ...current, name }))}
                  className="text-[14px] font-semibold leading-5 tracking-[-0.42px]"
                  style={{
                    height: 36,
                    flexShrink: 0,
                    padding: "0 14px",
                    border: selected ? "2px solid #60E1FF" : "1px solid #E9E8E8",
                    borderRadius: 999,
                    background: "#FFFFFF",
                    color: selected ? "#60E1FF" : "#D2D2D1",
                    whiteSpace: "nowrap",
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <h2
            className="absolute text-[18px] font-semibold leading-[1.38] tracking-[-0.54px] text-[#252525]"
            style={{ top: 399, left: 24 }}
          >
            언제 나가세요?
          </h2>
          <fieldset
            aria-label="외출 요일"
            className="absolute flex items-center justify-between border-0 p-0"
            style={{ top: 437, left: 24, right: 24, height: 46 }}
          >
            {DAYS.map((day) => {
              const selected = form.days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleDay(day)}
                  className="text-[16px] font-medium leading-6 tracking-[-0.16px]"
                  style={{
                    width: 45,
                    minWidth: 45,
                    height: 46,
                    flex: "0 0 45px",
                    border: selected ? "2px solid #60E1FF" : "1px solid #E9E8E8",
                    borderRadius: 15,
                    background: "#FFFFFF",
                    color: selected ? "#60E1FF" : "#D2D2D1",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </fieldset>

          <button
            type="button"
            onClick={() => {
              setDraftTime(form.time);
              setIsTimePickerOpen(true);
            }}
            aria-haspopup="dialog"
            aria-label={`외출 시간 ${formatTimeKo(form.time)} 변경`}
            className="absolute flex h-[52px] items-center justify-between rounded-[15px] border-2 border-[#E9E8E8] bg-white px-[18px] text-left"
            style={{ top: 497, left: 24, right: 24, paddingLeft: 18 }}
          >
            <span className="text-[14px] font-medium leading-[1.5] tracking-[-0.42px] text-[#BCBBBA]">
              외출 시간
            </span>
            <span className="text-[16px] font-medium leading-6 tracking-[-0.48px] text-[#4C4A48]">
              {formatTimeKo(form.time)}
            </span>
          </button>

          <BottomCTA bottomClassName="bottom-[112px]">
            <Button
              type="submit"
              className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]"
            >
              다음
            </Button>
          </BottomCTA>
        </form>
      </main>

      <BottomSheet
        isOpen={isTimePickerOpen}
        title="외출 시간 설정"
        onClose={() => setIsTimePickerOpen(false)}
      >
        <TimeWheelPicker value={draftTime} onChange={setDraftTime} useAmPm />
        <Button
          onClick={() => {
            setForm((current) => ({ ...current, time: draftTime }));
            setIsTimePickerOpen(false);
          }}
          className="mt-5 h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]"
        >
          완료
        </Button>
      </BottomSheet>
    </MobileLayout>
  );
}
