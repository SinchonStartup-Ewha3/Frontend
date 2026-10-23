import { useState } from "react";
import AlarmBadge from "../../components/AlarmBadge";
import BottomCTA from "../../components/BottomCTA";
import BottomSheet from "../../components/BottomSheet";
import Button from "../../components/Button";
import ConfirmDialog from "../../components/ConfirmDialog";
import FormField from "../../components/FormField";
import Header from "../../components/Header";
import LocationSearchSheet from "../../components/LocationSearchSheet";
import MobileLayout from "../../components/MobileLayout";
import PageHeading from "../../components/PageHeading";
import PageLayout from "../../components/PageLayout";
import ScheduleCard from "../../components/ScheduleCard";
import {
  useCreateSchedule,
  useDeleteSchedule,
  useSchedulesQuery,
} from "../../hooks/useAlarmSettings";
import useToast from "../../hooks/useToast";
import plusIcon from "../../assets/icons/plus.svg";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const INITIAL_FORM = {
  name: "",
  days: ["월", "금"],
  time: "18:00",
  region: "서울 성북구 안암동",
  regionCode: "",
};

export default function UmbrellaSchedulePage() {
  const toast = useToast();
  const { data: schedules = [] } = useSchedulesQuery("umbrella");
  const createSchedule = useCreateSchedule();
  const deleteSchedule = useDeleteSchedule("umbrella");
  const [isAdding, setIsAdding] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const toggleDay = (day) => {
    setForm((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((selected) => selected !== day)
        : [...current.days, day],
    }));
  };

  const closeAddSheet = () => {
    setIsAdding(false);
    setIsSearchingLocation(false);
  };

  const submitSchedule = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.days.length || !form.region.trim()) {
      toast.error("이름, 요일, 지역을 입력해 주세요.");
      return;
    }

    createSchedule.mutate(
      { ...form, type: "umbrella", name: form.name.trim(), leadMinutes: 60 },
      {
        onSuccess: () => {
          closeAddSheet();
          setForm(INITIAL_FORM);
          toast.success("우산 알림 일정을 추가했어요.");
        },
        onError: () => toast.error("일정을 추가하지 못했어요."),
      },
    );
  };

  return (
    <MobileLayout>
      <PageLayout nav={false} className="!px-0 !pb-0">
        <main className="min-h-screen px-6 pt-[73px] text-[#353331]">
          <Header back />

          <AlarmBadge type="umbrella" size={53} className="mt-[27px]" />
          <PageHeading
            title="우산 챙기세요"
            description="비가 예상될 때, 외출 전 미리 알려드려요"
            className="mt-[14px]"
            titleClassName="!text-[28px] !leading-[1.4] !tracking-[-0.84px]"
            descClassName="!mt-[4px] !whitespace-nowrap !text-[18px] !leading-[1.38] !tracking-[-0.54px] !text-[#D2D2D1]"
          />

          <section aria-labelledby="schedule-heading" className="mt-[23px]">
            <h2
              id="schedule-heading"
              className="text-[20px] font-semibold leading-[1.38] tracking-[-0.6px] text-[#252525]"
            >
              내 알림 일정 ({schedules.length})
            </h2>
            <div className="mt-[14px] flex flex-col gap-[7px]">
              {schedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  className="!h-[114px] !rounded-[20px] !border-[#D2D2D1]/60"
                  onDelete={setScheduleToDelete}
                />
              ))}
              {schedules.length === 0 && (
                <p className="py-8 text-center text-sm text-[#A5A4A3]">
                  등록된 알림 일정이 없어요.
                </p>
              )}
            </div>
          </section>

          <section aria-labelledby="add-schedule-heading" className="mt-[94px]">
            <h2
              id="add-schedule-heading"
              className="text-[20px] font-semibold leading-[1.38] tracking-[-0.6px] text-[#252525]"
            >
              새 일정 추가하기
            </h2>
          </section>
        </main>

        <BottomCTA bottomClassName="bottom-[124px]">
          <Button
            variant="soft"
            icon={plusIcon}
            iconClassName="!h-6 !w-6"
            onClick={() => setIsAdding(true)}
            className="h-[44px] !rounded-[10px] !bg-[#E5FAFF] !text-[18px]"
          >
            우산 알림 일정 추가
          </Button>
        </BottomCTA>

        <BottomSheet
          isOpen={isAdding}
          title="우산 알림 일정 추가"
          onClose={closeAddSheet}
          showHandle={false}
          className="!pb-8"
        >
          <form onSubmit={submitSchedule} className="space-y-5 pt-2">
            <FormField
              label="일정 이름"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="예: 학원 갈 때"
              maxLength={20}
              compact
              labelClassName="!mb-2 !text-sm"
              inputClassName="!rounded-[10px] !px-4"
            />

            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-[#1F1C1A]">
                알림 요일
              </legend>
              <div className="flex justify-between gap-1">
                {DAYS.map((day) => {
                  const selected = form.days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleDay(day)}
                      className={`h-10 w-10 rounded-full border text-sm font-semibold ${selected ? "border-main bg-soft text-main" : "border-[#E9E8E8] bg-white text-[#A5A4A3]"}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <FormField
              label="외출 시간"
              type="time"
              value={form.time}
              onChange={(event) =>
                setForm((current) => ({ ...current, time: event.target.value }))
              }
              compact
              labelClassName="!mb-2 !text-sm"
              inputClassName="!rounded-[10px] !px-4"
            />

            <div>
              <p className="mb-2 text-sm font-semibold text-[#1F1C1A]">알림 지역</p>
              <button
                type="button"
                onClick={() => setIsSearchingLocation(true)}
                className="flex h-[52px] w-full items-center rounded-[10px] border border-[#E9E8E8] bg-white px-4 text-left text-base font-medium text-[#252525]"
              >
                {form.region || "지역을 선택해 주세요"}
              </button>
            </div>

            <Button type="submit" disabled={createSchedule.isPending}>
              {createSchedule.isPending ? "추가 중..." : "일정 추가"}
            </Button>
          </form>
        </BottomSheet>

        <LocationSearchSheet
          isOpen={isSearchingLocation}
          onClose={() => setIsSearchingLocation(false)}
          selected={form.region}
          onSelect={(region, selection) => {
            setForm((current) => ({
              ...current,
              region,
              regionCode: selection?.region?.regionCode ?? "",
            }));
            setIsSearchingLocation(false);
          }}
        />

        <ConfirmDialog
          isOpen={Boolean(scheduleToDelete)}
          variant="scheduleDelete"
          title={scheduleToDelete ? `‘${scheduleToDelete.name}’ 일정을\n삭제할까요?` : undefined}
          cancelTone="light"
          loading={deleteSchedule.isPending}
          onCancel={() => setScheduleToDelete(null)}
          onConfirm={() => {
            if (!scheduleToDelete) return;
            deleteSchedule.mutate(scheduleToDelete.id, {
              onSuccess: () => {
                setScheduleToDelete(null);
                toast.success("일정을 삭제했어요.");
              },
              onError: () => toast.error("일정을 삭제하지 못했어요."),
            });
          }}
        />
      </PageLayout>
    </MobileLayout>
  );
}
