import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNickname } from "../../api/user";
import queryKeys from "../../api/queryKeys";
import Button from "../../components/Button";
import Header from "../../components/Header";
import InputField from "../../components/InputField";
import MobileLayout from "../../components/MobileLayout";
import useOnboardingStore from "../../store/useOnboardingStore";
import useUserStore from "../../store/useUserStore";

export default function NicknamePage() {
  const nickname = useOnboardingStore((state) => state.nickname);
  const setNickname = useOnboardingStore((state) => state.setNickname);
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateNickname,
    onSuccess: (user, submittedNickname) => {
      setNickname(submittedNickname);
      setUser(user);
      queryClient.setQueryData(queryKeys.profile, user);
      navigate(user.isOnboarded ? "/home" : "/location-setup", {
        replace: true,
      });
    },
  });
  const normalizedNickname = nickname.trim();
  const nicknameLength = Array.from(normalizedNickname).length;
  const errorMessage =
    mutation.error?.response?.data?.nickname?.[0] ??
    (mutation.error ? "닉네임 설정에 실패했어요. 다시 시도해주세요." : "");

  const handleSubmit = () => {
    if (nicknameLength < 1 || nicknameLength > 10 || mutation.isPending) return;
    mutation.mutate(normalizedNickname);
  };

  return (
    <MobileLayout>
    <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] overflow-hidden bg-white text-[#353331]">
      <div className="absolute left-6 right-6 top-6 z-10">
        <Header back onLeft={() => navigate("/login-complete")} />
      </div>
      <h1 className="absolute left-6 right-6 top-[137px] text-[30px] font-semibold leading-[1.4] tracking-[-0.9px]">
        반가워요!<br />어떤 이름으로 불러드릴까요?
      </h1>

      <div className="absolute left-6 right-6 top-[278px]">
        <InputField
          value={nickname}
          onChange={(event) => {
            setNickname(event.target.value);
            mutation.reset();
          }}
          placeholder="닉네임을 입력해주세요"
          maxLength={10}
          aria-label="닉네임"
          className="!h-[60px] !rounded-[15px] !border-2 !px-6 !text-[18px] !tracking-[-0.18px] placeholder:!text-[#D2D2D1]"
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? "nickname-error" : undefined}
          disabled={mutation.isPending}
        />
      </div>

      {errorMessage ? (
        <p id="nickname-error" role="alert" className="absolute left-6 right-6 top-[348px] text-[14px] font-semibold leading-[1.5] text-red-500">
          {errorMessage}
        </p>
      ) : (
        <p className="absolute right-6 top-[348px] text-[14px] font-semibold leading-[1.5] tracking-[-0.42px] text-[#D2D2D1]">
          {Array.from(nickname).length} / 10
        </p>
      )}

      <div className="absolute left-6 top-[696px] w-[calc(100%-48px)] max-w-[345px]">
        <Button variant="primary" onClick={handleSubmit} disabled={nicknameLength < 1 || nicknameLength > 10 || mutation.isPending} className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]">
          {mutation.isPending ? "설정 중..." : "다음"}
        </Button>
      </div>
    </main>
    </MobileLayout>
  );
}
