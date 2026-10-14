
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AlarmBadge from "../../components/AlarmBadge";
import BottomCTA from "../../components/BottomCTA";
import Button from "../../components/Button";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import PageHeading from "../../components/PageHeading";
import PageLayout from "../../components/PageLayout";
import Toggle from "../../components/Toggle";
import { ALARM_LIST } from "../../constants/alarmTypes";
import {
  useAlarmSettingsQuery,
  useUpdateAlarmSettings,
} from "../../hooks/useAlarmSettings";
import useToast from "../../hooks/useToast";
import useAlarmDraftStore from "../../store/useAlarmDraftStore";

const DEFAULT_SETTINGS = {
  outer: true,
  exercise: false,
  laundry: false,
  umbrella: true,
};

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: settings } = useAlarmSettingsQuery();
  const updateSettings = useUpdateAlarmSettings();
  const draft = useAlarmDraftStore((state) => state.draft);
  const initDraft = useAlarmDraftStore((state) => state.init);
  const toggleDraft = useAlarmDraftStore((state) => state.toggle);
  const clearDraft = useAlarmDraftStore((state) => state.clear);
  const initialized = useRef(false);

  useEffect(() => {
    if (settings && !initialized.current) {
      initDraft(settings);
      initialized.current = true;
    }
  }, [settings, initDraft]);

  useEffect(() => () => clearDraft(), [clearDraft]);

  const values = draft ?? DEFAULT_SETTINGS;
  const save = () => {
    updateSettings.mutate(
      {
        outer: values.outer,
        exercise: values.exercise,
        laundry: values.laundry,
      },
      {
        onSuccess: () => {
          clearDraft();
          toast.success("알림 설정을 저장했어요.");
          navigate(-1);
        },
        onError: () => toast.error("알림 설정을 저장하지 못했어요."),
      },
    );
  };

  return (
    <MobileLayout>
      <PageLayout nav={false} className="!px-0 !pb-0">
        <main className="min-h-screen px-6 pt-[73px] text-[#353331]">
          <Header back />

          <PageHeading
            title="맞춤형 행동 알림"
            description={"당신의 하루에 꼭 필요한 알림을\n미리 알려드릴게요"}
            className="mt-[15px]"
            titleClassName="!text-[28px] !leading-[1.4] !tracking-[-0.84px]"
            descClassName="!mt-[8px] !text-[18px] !leading-[1.38] !tracking-[-0.54px] !text-[#D2D2D1]"
          />

          <section aria-label="행동 알림 항목" className="mt-[15px]">
            {ALARM_LIST.map((alarm, index) => (
              <div key={alarm.id}>
                <div className="flex h-[78px] items-center">
                  <AlarmBadge type={alarm.id} />
                  <div className="ml-4 min-w-0 flex-1">
                    <h2 className="text-[16px] font-semibold leading-[22px] tracking-[-0.48px] text-[#4C4A48]">
                      {alarm.title}
                    </h2>
                    <p className="mt-[2px] text-[14px] font-medium leading-[20px] tracking-[-0.14px] text-[#BCBBBA]">
                      {alarm.sub}
                    </p>
                  </div>

                  {alarm.hasSchedule ? (
                    <button
                      type="button"
                      onClick={() => navigate("/mypage/notifications/umbrella")}
                      aria-label={`${alarm.title} 일정 설정`}
                      className="flex h-11 w-10 shrink-0 items-center justify-end"
                    >
                      <span className="border-r-[2px] border-t-[2px] border-[#BCBBBA] h-[9px] w-[9px] rotate-45" />
                    </button>
                  ) : (
                    <Toggle
                      label={`${alarm.title} 알림`}
                      on={Boolean(values[alarm.id])}
                      onChange={() => toggleDraft(alarm.id)}
                      size="md"
                    />
                  )}
                </div>
                {index < ALARM_LIST.length - 1 && (
                  <div aria-hidden="true" className="h-px bg-[#E9E8E8]" />
                )}
              </div>
            ))}
          </section>
        </main>

        <BottomCTA bottomClassName="bottom-[124px]">
          <Button
            onClick={save}
            disabled={updateSettings.isPending}
            className="h-[44px] !rounded-[10px] !text-[16px]"
          >
            {updateSettings.isPending ? "저장 중..." : "확인"}
          </Button>
        </BottomCTA>
      </PageLayout>
    </MobileLayout>
  );
}