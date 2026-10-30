import { useNavigate } from "react-router-dom";
import BottomCTA from "../../components/BottomCTA";
import Button from "../../components/Button";
import MobileLayout from "../../components/MobileLayout";
import surveyCharacter from "../../assets/images/survey_character.svg";

export default function PremiumSurveyCompletePage({ bankTransfer = false }) {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] overflow-hidden bg-white text-[#353331]">
        <div
          className="absolute left-1/2 top-[161px] h-[34px] w-[34px] -translate-x-1/2"
          aria-hidden="true"
        >
          <svg viewBox="0 0 34 34" fill="none" className="h-full w-full">
            <circle cx="17" cy="17" r="17" fill="#60E1FF" />
            <path
              d="m10.5 17.2 4.2 4.2 8.8-9"
              stroke="white"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className={`absolute left-0 right-0 text-center font-semibold leading-[1.4] ${bankTransfer ? "top-[195px] text-[26px] tracking-[-0.78px]" : "top-[210px] text-[30px] tracking-[-0.9px]"}`}>
          {bankTransfer ? <>입금 확인이 완료되면<br />Premium 기능을 사용할 수 있어요</> : "설문조사가 완료되었어요"}
        </h1>

        <p className={`absolute left-0 right-0 text-center font-medium leading-[1.38] tracking-[-0.54px] text-[#A5A4A3] ${bankTransfer ? "top-[287px] text-[18px]" : "top-[267px] text-[18px]"}`}>
          {bankTransfer ? "결제 상태는 마이페이지에서 확인할 수 있어요" : <>이제 Wee와 함께<br />더 특별한 날씨 경험을 시작해요</>}
        </p>

        <div
          className="absolute top-[348px] h-[303px] w-[212px] -translate-x-1/2 overflow-hidden"
          style={{ left: "calc(50% - 3.5px)" }}
        >
          <img
            src={surveyCharacter}
            alt="설문 완료를 축하하는 WEE 캐릭터"
            className="absolute left-0 top-[-24.42%] h-auto w-full max-w-none"
          />
        </div>

        {bankTransfer && (
          <p className="absolute left-0 right-0 top-[622px] text-center text-[14px] font-medium leading-[1.38] tracking-[-0.42px] text-[#A5A4A3]">
            입금 확인은 평균 하루 이내로 완료됩니다
          </p>
        )}

        <BottomCTA bottomClassName="bottom-[112px]">
          <Button
            onClick={() => navigate(bankTransfer ? "/premium/welcome" : "/home")}
            className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]"
          >
            완료
          </Button>
        </BottomCTA>
      </main>
    </MobileLayout>
  );
}
