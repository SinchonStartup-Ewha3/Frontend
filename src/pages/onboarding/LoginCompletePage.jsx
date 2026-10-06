import Button from "../../components/Button";
import Header from "../../components/Header";
import completeCharacter from "../../assets/images/login_complete_character.svg";
import { useNavigate } from "react-router-dom";

export default function LoginCompletePage() {
  const navigate = useNavigate();

  return (
    <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] overflow-hidden bg-white text-[#353331]">
      <div className="absolute left-1/2 top-[153px] h-[34px] w-[34px] -translate-x-1/2" aria-hidden="true">
        <svg viewBox="0 0 34 34" fill="none" className="h-full w-full">
          <circle cx="17" cy="17" r="17" fill="#60E1FF" />
          <path d="m10.5 17.2 4.2 4.2 8.8-9" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="absolute left-6 right-6 top-6 z-10">
        <Header back onLeft={() => navigate("/")} />
      </div>

      <h1 className="absolute left-0 right-0 top-[208px] text-center text-[30px] font-semibold leading-[1.4] tracking-[-0.9px]">
        로그인이 완료되었어요!
      </h1>

      <p className="absolute left-0 right-0 top-[267px] text-center text-[18px] font-medium leading-[1.38] tracking-[-0.54px] text-[#a5a4a3]">
        이제 WEE와 함께<br />더 특별한 날씨 경험을 시작해요
      </p>

      <div className="absolute left-1/2 top-[369px] h-[293px] w-[222px] -translate-x-1/2 overflow-hidden">
        <img
          src={completeCharacter}
          alt="로그인 완료를 축하하는 WEE 캐릭터"
          className="absolute left-0 top-[-34.55%] h-auto w-full max-w-none"
        />
      </div>

      <div className="absolute left-6 top-[696px] w-[calc(100%-48px)] max-w-[345px]">
        <Button variant="primary" 
        onClick={() => navigate("/nickname")}
        className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]">
          다음
        </Button>
      </div>
    </main>
  );
}
