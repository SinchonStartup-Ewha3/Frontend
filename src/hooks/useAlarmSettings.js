// 알람 설정 기능 관련 custom hook
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSchedule,
  deleteSchedule,
  fetchAlarmSettings,
  fetchSchedules,
  updateAlarmSettings,
} from "../api/notification";
import queryKeys from "../api/queryKeys";

// 알림 종류별 ON/OFF 조회
export const useAlarmSettingsQuery = () =>
  useQuery({ queryKey: queryKeys.alarmSettings, queryFn: fetchAlarmSettings });

// 알림 ON/OFF 저장. 마이페이지에서 토글하면 바로 반영되도록 "낙관적 업데이트"!!
export const useUpdateAlarmSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAlarmSettings,
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.alarmSettings });
      const previous = queryClient.getQueryData(queryKeys.alarmSettings);
      queryClient.setQueryData(queryKeys.alarmSettings, (old) => ({
        ...old,
        ...patch,
      }));
      return { previous };
    },
    // 실패하면 이전 값으로 되돌리기
    onError: (_err, _patch, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(queryKeys.alarmSettings, ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.alarmSettings }),
  });
};

// 알림 일정 목록 (type: "umbrella" 등)
export const useSchedulesQuery = (type) =>
  useQuery({
    queryKey: queryKeys.schedules(type),
    queryFn: () => fetchSchedules(type),
    enabled: Boolean(type),
  });

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSchedule,
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.schedules(variables.type),
      }),
  });
};

export const useDeleteSchedule = (type) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules(type) }),
  });
};
