import Button from "../../components/Button";
import loginBackground from "../../assets/images/kakaologin_background.svg";
import weeLogo from "../../assets/icons/logo.svg";
import kakaoIcon from "../../assets/icons/kakao.svg";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <main className="relative mx-auto flex min-h-[852px] w-full max-w-[402px] flex-col overflow-hidden bg-[#7eafc8] text-white">
      <img
        src={loginBackground}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      <div className="relative z-10 h-[54px] shrink-0" aria-hidden="true" />
      <div className="absolute left-6 right-6 top-6 z-20">
        <Header />
      </div>

      <section className="relative z-10 flex flex-1 flex-col">
        <div className="absolute left-1/2 top-[90px] h-[81px] w-[216px] -translate-x-1/2">
          <img src={weeLogo} alt="wee" className="h-[81px] w-[216px] max-w-none" />
        </div>

        <p className="absolute left-0 right-0 top-[180px] text-center font-sans text-[18px] font-semibold leading-[1.38] tracking-[-0.54px]">
          오늘의 날씨를<br />오늘의 행동으로
        </p>

        <div className="absolute bottom-[113px] left-1/2 w-[calc(100%-44px)] max-w-[345px] -translate-x-1/2">
          <Button
            variant="kakao"
            className="relative h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]"
            onClick={() => navigate("/login-complete")}
          >
            <span className="absolute left-[70px] flex h-[34px] w-[34px] items-center justify-center" aria-hidden="true">
              <img src={kakaoIcon} alt="" />
            </span>
            <span className="translate-x-[18px]">카카오톡으로 시작하기</span>
          </Button>
        </div>
      </section>

    </main>
  );
}
