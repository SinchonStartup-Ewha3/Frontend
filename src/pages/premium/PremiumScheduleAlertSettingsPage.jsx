import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomCTA from "../../components/BottomCTA";
import Button from "../../components/Button";
import LocationSearchSheet from "../../components/LocationSearchSheet";
import MobileLayout from "../../components/MobileLayout";
import PageHeading from "../../components/PageHeading";
import { LEAD_OPTIONS } from "../../constants/premium";
import { useCreateSchedule } from "../../hooks/useAlarmSettings";
import useToast from "../../hooks/useToast";
import useUserStore from "../../store/useUserStore";
import chevronRightIcon from "../../assets/icons/chevron-right.svg";
import { formatAlarmTime, formatDays, lastRegionWord } from "../../utils/format";

const DEFAULT_SCHEDULE = {
  name: "학원 갈 때",
  days: ["월", "금"],
  time: "18:00",
};

const getRegionLabel = (region) =>
  region.replace(/^서울(?:특별시)?\s*/, "").trim();

export default function PremiumScheduleAlertSettingsPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const toast = useToast();
  const user = useUserStore((current) => current.user);
  const createSchedule = useCreateSchedule();
  const schedule = state ?? DEFAULT_SCHEDULE;
  const [region, setRegion] = useState(user?.region || "서울 성북구 안암동");
  const [leadMinutes, setLeadMinutes] = useState(null);
  const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);
  const effectiveLeadMinutes = leadMinutes ?? 60;
  const summaryRegion = lastRegionWord(getRegionLabel(region));

  const handleNext = () => {
    if (!schedule.name?.trim() || !schedule.days?.length || !region.trim()) {
      toast.error("일정 이름, 요일, 지역을 확인해 주세요.");
      return;
    }
    createSchedule.mutate(
      {
        type: "premium",
        name: schedule.name.trim(),
        days: schedule.days,
        time: schedule.time || "18:00",
        region,
        leadMinutes: effectiveLeadMinutes,
      },
      {
        onSuccess: () => {
          toast.success("알림 일정을 추가했어요.");
          navigate("/premium/survey/complete");
        },
        onError: () => toast.error("일정을 추가하지 못했어요."),
      },
    );
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

        <h2
          className="absolute text-[18px] font-semibold leading-[1.38] tracking-[-0.54px] text-[#252525]"
          style={{ top: 225, left: 24 }}
        >
          어디 날씨를 기준으로 할까요?
        </h2>
        <button
          type="button"
          onClick={() => setIsLocationSearchOpen(true)}
          className="absolute flex h-[52px] items-center justify-between rounded-[15px] border-2 border-[#D2D2D1] bg-[#F4F4F4] px-5 text-left text-[14px] font-medium leading-[1.5] tracking-[-0.42px] text-[#4C4A48]"
          style={{ top: 266, left: 24, right: 24 }}
        >
          <span>{getRegionLabel(region)}</span>
          <img src={chevronRightIcon} alt="" className="h-4 w-4 opacity-50" />
        </button>

        <h2
          className="absolute text-[18px] font-semibold leading-[1.38] tracking-[-0.54px] text-[#252525]"
          style={{ top: 359, left: 24 }}
        >
          알림은 몇 시에 받을까요?
        </h2>
        <div
          role="radiogroup"
          aria-label="알림 시점"
          className="absolute flex items-center"
          style={{ top: 396, left: 24, right: 24, gap: 6 }}
        >
          {LEAD_OPTIONS.map((option) => {
            const selected = leadMinutes === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setLeadMinutes(option.value)}
                className="h-[46px] text-[14px] font-medium leading-[1.5] tracking-[-0.14px]"
                style={{
                  flex: "1 1 0",
                  minWidth: 0,
                  border: selected ? "2px solid #60E1FF" : "2px solid #E9E8E8",
                  borderRadius: 15,
                  background: selected ? "#E5FAFF" : "#FFFFFF",
                  color: selected ? "#60E1FF" : "#D2D2D1",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <section
          aria-label="알림 미리보기"
          className="absolute rounded-[15px] border-2 border-main bg-soft px-[18px] pt-[14px]"
          style={{ top: 471, left: 24, right: 24, height: 116 }}
        >
          <p className="text-[14px] font-semibold leading-[1.5] tracking-[-0.42px] text-main">
            이렇게 보내드려요
          </p>
          <p className="mt-[3px] whitespace-pre-line text-[16px] font-semibold leading-[1.5] tracking-[-0.48px] text-[#4C4A48]">
            {`매주 ${formatDays(schedule.days)} ${formatAlarmTime(schedule.time || "18:00", effectiveLeadMinutes)},\n${summaryRegion} 날씨로 ‘${schedule.name}’ 알림`}
          </p>
        </section>

        <BottomCTA bottomClassName="bottom-[112px]">
          <Button
            onClick={handleNext}
            disabled={createSchedule.isPending}
            className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]"
          >
            {createSchedule.isPending ? "저장 중..." : "다음"}
          </Button>
        </BottomCTA>
      </main>

      <LocationSearchSheet
        isOpen={isLocationSearchOpen}
        onClose={() => setIsLocationSearchOpen(false)}
        selected={region}
        onSelect={(nextRegion) => {
          setRegion(nextRegion);
          setIsLocationSearchOpen(false);
        }}
      />
    </MobileLayout>
  );
}
