import { useNavigate } from "react-router-dom";
import BottomCTA from "../../components/BottomCTA";
import Button from "../../components/Button";
import MobileLayout from "../../components/MobileLayout";
import premiumCharacter from "../../assets/images/premium_character.svg";

export default function PremiumWelcomePage() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <main
        className="relative mx-auto min-h-[852px] w-full max-w-[402px] overflow-hidden text-[#353331]"
        style={{
          backgroundImage:
            "linear-gradient(155.66deg, #E8F5FB 0.61%, #FFFFFF 42.09%, #F2FBFF 81.2%, #ECE9FD 98.64%)",
        }}
      >
        <h1
          className="absolute text-center text-[30px] font-semibold leading-[1.4] tracking-[-0.9px]"
          style={{ top: 155, left: 16, right: 16 }}
        >
          유저가 된 것을
          <br />
          환영합니다!
        </h1>

        <p
          className="absolute text-center text-[18px] font-medium leading-[1.5] tracking-[-0.54px] text-[#A5A4A3]"
          style={{ top: 249, left: 16, right: 16 }}
        >
          이제 맞춤형 행동 알림을 위한
          <br />
          간단한 설문 조사를 진행할 예정이에요
        </p>

        <img
          src={premiumCharacter}
          alt=""
          className="absolute object-contain"
          style={{
            top: 333,
            left: "50%",
            width: 253,
            height: 253,
            transform: "translateX(-50%)",
          }}
        />

        <BottomCTA bottomClassName="bottom-[112px]">
          <Button
            onClick={() => navigate("/premium/survey")}
            className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]"
          >
            설문조사 하러 가기
          </Button>
        </BottomCTA>
      </main>
    </MobileLayout>
  );
}
