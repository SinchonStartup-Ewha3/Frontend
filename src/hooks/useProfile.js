// profile 관련 custom hook
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchProfile,
  deleteProfileImage,
  updateNickname,
  updateProfile,
  uploadProfileImage,
  withdrawUser,
} from "../api/user";
import queryKeys from "../api/queryKeys";
import useUserStore from "../store/useUserStore";
import { logoutOneSignalUser } from "../push/oneSignal";

// 내 프로필 조회. 성공하면 zustand(useUserStore)에도 복사.
export const useProfileQuery = ({ enabled = true } = {}) => {
  const setUser = useUserStore((s) => s.setUser);
  const query = useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfile,
    enabled,
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

// 닉네임 전용 API 응답으로 프로필 캐시와 전역 사용자 정보를 갱신
export const useUpdateNickname = () => {
  const queryClient = useQueryClient();
  const setUser = useUserStore((s) => s.setUser);
  return useMutation({
    mutationFn: updateNickname,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.profile, user);
      setUser(user);
    },
  });
};

// 프로필 사진 업로드 후 서버의 최신 내 정보로 캐시와 전역 상태를 갱신
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();
  const setUser = useUserStore((s) => s.setUser);
  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.profile, user);
      setUser(user);
    },
  });
};

// 직접 올린 사진 삭제 후 카카오 사진(또는 기본 이미지)으로 복원
export const useDeleteProfileImage = () => {
  const queryClient = useQueryClient();
  const setUser = useUserStore((s) => s.setUser);
  return useMutation({
    mutationFn: deleteProfileImage,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.profile, user);
      setUser(user);
    },
  });
};

// 회원 탈퇴 — 성공하면 캐시/전역 상태를 전부 비우자~~~
export const useWithdraw = () => {
  const queryClient = useQueryClient();
  const clearUser = useUserStore((s) => s.clearUser);
  return useMutation({
    mutationFn: withdrawUser,
    onSuccess: () => {
      void logoutOneSignalUser().catch((error) =>
        console.warn("OneSignal 로그아웃 실패", error),
      );
      localStorage.removeItem("wee_access_token");
      localStorage.removeItem("wee_refresh_token");
      queryClient.clear();
      clearUser();
    },
  });
};
