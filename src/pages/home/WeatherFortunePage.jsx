import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Card from "../../components/Card";
import MobileLayout from "../../components/MobileLayout";
import wizardCharacter from "../../assets/images/fortune/fortune_wizard.svg";

export default function WeatherFortunePage() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <main
        className="relative mx-auto min-h-[852px] w-full max-w-[390px] overflow-hidden text-[#353331]"
        style={{
          backgroundImage:
            "linear-gradient(158.32deg, #fff 3.3%, #f9f4fe 24.56%, #dcf4fc 67.5%, #fff 99.09%)",
        }}
      >
        <p className="absolute left-0 right-0 top-[111px] text-center text-[16px] font-semibold leading-[1.5] tracking-[-0.48px] text-[#D2D2D1]">
          오늘 나의 운세가 궁금하다면?
        </p>

        <h1 className="absolute left-0 right-0 top-[145px] text-center text-[30px] font-semibold leading-[1.4] tracking-[-0.9px]">
          비오는 하루
          <br />
          오늘의 운세를 확인해봐요
        </h1>

        <div
          aria-hidden="true"
          className="absolute left-[calc(50%-190px)] top-[290px] h-[243px] w-[171px] rotate-[-13.56deg] rounded-[21px] bg-white/50"
        />
        <div
          aria-hidden="true"
          className="absolute left-[calc(50%+20px)] top-[290px] h-[243px] w-[171px] rotate-[13.56deg] rounded-[21px] bg-white/50"
        />

        <Card className="absolute left-1/2 top-[277px] z-10 h-[268px] w-[188px] -translate-x-1/2 !rounded-[23px] !border-0 !p-0 shadow-[0_3px_5px_rgba(53,51,49,0.12)]">
          <p className="absolute left-0 right-0 top-[24px] text-center text-[14px] font-semibold leading-[1.38] tracking-[-0.42px] text-[#62605F]">
            오늘 운수 매우 좋은
            <br />
            테루테루
          </p>
          <div className="absolute left-1/2 top-[72px] h-[134px] w-[111px] -translate-x-1/2">
            <img
              src={wizardCharacter}
              alt="마법사 복장을 한 테루테루 캐릭터"
              className="absolute left-1/2 top-0 max-w-none -translate-x-1/2 origin-top scale-[0.621]"
            />
          </div>
          <p className="absolute left-0 right-0 top-[210px] text-center text-[12px] font-medium leading-[1.5] tracking-[-0.36px] text-[#A5A4A3]">
            오늘은 아주 멋진 날이
            <br />
            기대될 예정입니다
          </p>
        </Card>

        <Button
          variant="white"
          className="absolute left-1/2 top-[611px] !h-[44px] !w-[345px] -translate-x-1/2 rounded-[10px] text-[18px] tracking-[-0.18px]"
        >
          오늘의 운세 보기
        </Button>

        <button
          type="button"
          className="absolute left-1/2 top-[671px] -translate-x-1/2 whitespace-nowrap text-[14px] font-medium leading-[19px] tracking-[-0.42px] text-[#353331] underline underline-offset-2"
        >
          유료 결제 하러 가기
        </button>

        <button
          type="button"
          onClick={() => navigate("/home")}
          className="absolute left-1/2 top-[694px] -translate-x-1/2 whitespace-nowrap text-[16px] font-semibold leading-[1.5] tracking-[-0.48px] text-[#D2D2D1]"
        >
          뒤로가기
        </button>
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[714px] h-px w-[54px] -translate-x-1/2 bg-[#D2D2D1]"
        />
      </main>
    </MobileLayout>
  );
}
