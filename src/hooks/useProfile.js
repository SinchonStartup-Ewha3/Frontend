// profile 관련 custom hook
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProfile, updateProfile, withdrawUser } from "../api/user";
import queryKeys from "../api/queryKeys";
import useUserStore from "../store/useUserStore";

// 내 프로필 조회. 성공하면 zustand(useUserStore)에도 복사.
export const useProfileQuery = () => {
  const setUser = useUserStore((s) => s.setUser);
  const query = useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfile,
  });
  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);
  return query;
};

// 프로필 수정 (닉네임 / 지역 / 프로필 사진)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => queryClient.setQueryData(queryKeys.profile, user),
  });
};

// 회원 탈퇴 — 성공하면 캐시/전역 상태를 전부 비우자~~~
export const useWithdraw = () => {
  const queryClient = useQueryClient();
  const clearUser = useUserStore((s) => s.clearUser);
  return useMutation({
    mutationFn: withdrawUser,
    onSuccess: () => {
      queryClient.clear();
      clearUser();
    },
  });
};
