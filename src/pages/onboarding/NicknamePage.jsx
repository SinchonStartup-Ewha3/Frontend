import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Header from "../../components/Header";
import InputField from "../../components/InputField";
import MobileLayout from "../../components/MobileLayout";
import useOnboardingStore from "../../store/useOnboardingStore";

export default function NicknamePage() {
  const nickname = useOnboardingStore((state) => state.nickname);
  const setNickname = useOnboardingStore((state) => state.setNickname);
  const navigate = useNavigate();

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
          onChange={(event) => setNickname(event.target.value)}
          placeholder="닉네임을 입력해주세요"
          maxLength={10}
          aria-label="닉네임"
          className="!h-[60px] !rounded-[15px] !border-2 !px-6 !text-[18px] !tracking-[-0.18px] placeholder:!text-[#D2D2D1]"
        />
      </div>

      <p className="absolute right-6 top-[348px] text-[14px] font-semibold leading-[1.5] tracking-[-0.42px] text-[#D2D2D1]">
        {nickname.length} / 10
      </p>

      <div className="absolute left-6 top-[696px] w-[calc(100%-48px)] max-w-[345px]">
        <Button variant="primary" onClick={() => navigate("/birth-info")} className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]">
          다음
        </Button>
      </div>
    </main>
    </MobileLayout>
  );
}
