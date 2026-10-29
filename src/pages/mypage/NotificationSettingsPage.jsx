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
import usePushNotification from "../../hooks/usePushNotification";

const DEFAULT_SETTINGS = {
  outer: false,
  exercise: false,
  laundry: false,
  umbrella: false,
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
  const push = usePushNotification();
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

  const enablePush = async () => {
    try {
      const result = await push.enable();
      if (result.ok) toast.success("알림을 받을 수 있도록 설정했어요.");
      else if (result.reason === "denied") {
        toast.error(
          "알림이 차단되어 있어요. 브라우저 설정에서 Weether 알림을 허용해 주세요.",
        );
      } else if (result.reason === "unsupported") {
        toast.error("이 브라우저에서는 웹 푸시 알림을 지원하지 않아요.");
      } else if (result.reason === "failed") {
        toast.error("알림 구독에 실패했어요. 잠시 후 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error("OneSignal 푸시 구독 실패", error);
      const reason = error instanceof Error ? error.message : String(error ?? "");
      toast.error(
        reason
          ? `푸시 구독 실패: ${reason}`
          : "푸시 구독에 실패했어요. 잠시 후 다시 시도해 주세요.",
      );
    }
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
            titleClassName="!text-[24px] !leading-[1.4] !tracking-[-0.72px]"
            descClassName="!mt-[8px] !text-[18px] !leading-[1.38] !tracking-[-0.54px] !text-[#D2D2D1]"
          />

          <section
            aria-label="푸시 알림 구독"
            className="mt-[18px] rounded-[13px] border border-[#E9E8E8] bg-white px-4 py-4"
          >
            <p className="text-[14px] leading-[20px] text-[#797776]">
              Weether에서 내가 선택한 맞춤 알림을 받아보세요.
            </p>
            {push.permission === "denied" ? (
              <p className="mt-2 text-[13px] leading-[18px] text-[#8F8E8D]">
                알림이 차단되어 있어요. 브라우저 설정에서 Weether 알림을 직접
                허용해 주세요.
              </p>
            ) : push.iosInstallRequired ? (
              <p className="mt-2 text-[13px] leading-[18px] text-[#8F8E8D]">
                iPhone/iPad에서는 Safari 공유 버튼을 눌러 홈 화면에 추가한 뒤,
                설치된 Weether에서 알림을 설정해 주세요.
              </p>
            ) : push.permission === "granted" && push.subscribed === true ? (
              <p className="mt-2 text-[13px] leading-[18px] text-[#8F8E8D]">
                알림이 켜져 있어요.
              </p>
            ) : push.permission === "granted" && push.subscribed === null ? (
              <p className="mt-2 text-[13px] leading-[18px] text-[#8F8E8D]">
                알림 상태를 확인하고 있어요.
              </p>
            ) : push.supported ? (
              <>
                {/* 권한은 허용인데 구독이 안 된 경우 → 다시 구독하도록 안내 */}
                {push.permission === "granted" && (
                  <p className="mt-2 text-[13px] leading-[18px] text-[#8F8E8D]">
                    알림 구독이 완료되지 않았어요. 아래 버튼을 눌러 다시 설정해
                    주세요.
                  </p>
                )}
                <Button
                  type="button"
                  variant="soft"
                  onClick={enablePush}
                  className="mt-3 h-[40px] !rounded-[9px] !text-[14px]"
                >
                  알림 받기
                </Button>
              </>
            ) : (
              <p className="mt-2 text-[13px] leading-[18px] text-[#8F8E8D]">
                이 브라우저에서는 웹 푸시 알림을 지원하지 않아요.
              </p>
            )}
          </section>

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
