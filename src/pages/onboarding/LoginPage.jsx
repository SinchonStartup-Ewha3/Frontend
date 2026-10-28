import { useState } from "react";
import Button from "../../components/Button";
import loginBackground from "../../assets/images/kakaologin_background.svg";
import weeLogo from "../../assets/icons/logo.svg";
import kakaoIcon from "../../assets/icons/kakao.svg";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { KAKAO_JS_KEY } from "../../api/config";
import { loginWithKakao } from "../../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleKakaoLogin = () => {
    setLoginError("");

    if (!KAKAO_JS_KEY) {
      setLoginError("카카오 JavaScript 키를 설정해주세요.");
      return;
    }

    if (!window.Kakao) {
      setLoginError("카카오 로그인을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY);
    }

    setIsLoggingIn(true);
    window.Kakao.Auth.login({
      persistAccessToken: false,
      success: async ({ access_token: kakaoAccessToken }) => {
        try {
          const data = await loginWithKakao(kakaoAccessToken);
          localStorage.setItem("wee_access_token", data.access_token);
          localStorage.setItem("wee_refresh_token", data.refresh_token);
          navigate("/login-complete", {
            replace: true,
            state: { from: location.state?.from },
          });
        } catch (error) {
          setLoginError(
            error.response?.data?.detail ??
              error.response?.data?.provider?.[0] ??
              "로그인에 실패했어요. 잠시 후 다시 시도해주세요.",
          );
          setIsLoggingIn(false);
        }
      },
      fail: () => {
        setLoginError("카카오 로그인이 취소되었거나 실패했어요.");
        setIsLoggingIn(false);
      },
    });
  };

  return (
    <MobileLayout>
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

        <div className="absolute bottom-[63px] left-1/2 flex w-[calc(100%-44px)] max-w-[345px] -translate-x-1/2 flex-col gap-[13px]">
          <Button
            variant="primary"
            className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]"
            onClick={() => navigate("/location-setup", { replace: true })}
          >
            로그인 없이 시작하기
          </Button>
          <Button
            variant="kakao"
            className="relative h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]"
            onClick={handleKakaoLogin}
            disabled={isLoggingIn}
          >
            <span className="absolute left-[70px] flex h-[34px] w-[34px] items-center justify-center" aria-hidden="true">
              <img src={kakaoIcon} alt="" />
            </span>
            <span className="translate-x-[18px]">
              {isLoggingIn ? "로그인 중..." : "카카오톡으로 시작하기"}
            </span>
          </Button>
          {loginError && (
            <p className="mt-3 text-center text-sm font-medium text-white" role="alert">
              {loginError}
            </p>
          )}
          <p
            className="mt-3 text-center text-[11px] font-medium leading-5 text-[#A6A2A0]"
            style={{ textShadow: "0 1px 2px rgba(255,255,255,0.9)" }}
          >
            로그인하면 <Link to="/terms" className="font-semibold underline underline-offset-2">이용약관</Link>과{" "}
            <Link to="/privacy" className="font-semibold underline underline-offset-2">개인정보처리방침</Link>에 동의한 것으로 봅니다.
          </p>
        </div>
      </section>

      <nav
        aria-label="정책 및 고객지원"
        className="absolute bottom-4 left-0 right-0 z-10 flex flex-wrap justify-center gap-x-3 gap-y-1 px-4 text-[11px] font-medium text-[#A6A2A0]"
        style={{ textShadow: "0 1px 2px rgba(255,255,255,0.9)" }}
      >
        <Link to="/terms" className="underline underline-offset-2">이용약관</Link>
        <Link to="/privacy" className="underline underline-offset-2">개인정보처리방침</Link>
        <Link to="/refund" className="underline underline-offset-2">환불정책</Link>
        <Link to="/contact" className="underline underline-offset-2">문의</Link>
      </nav>

    </main>
    </MobileLayout>
  );
}
