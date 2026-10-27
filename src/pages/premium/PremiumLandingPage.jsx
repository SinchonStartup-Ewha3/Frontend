import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/Button";
import MobileLayout from "../../components/MobileLayout";
import PremiumCheckoutSheet from "../../components/PremiumCheckoutSheet";
import { PREMIUM_PLAN } from "../../constants/premium";
import weeLogo from "../../assets/icons/logo.svg";

const benefits = [
  ["옷차림 알림", "체감온도에 맞춘 겉옷과 옷차림을 알려드려요."],
  ["운동하기 좋은 시간", "날씨를 고려해 야외 활동에 알맞은 시간을 안내해요."],
  ["빨래 날씨 알림", "강수와 습도 정보를 바탕으로 빨래 팁을 받아보세요."],
  ["우산 알림", "비가 오거나 비 예보가 있을 때 미리 알려드려요."],
];

const legalLinks = [
  ["이용약관", "/terms"],
  ["개인정보처리방침", "/privacy"],
  ["환불정책", "/refund"],
  ["문의", "/contact"],
];

export default function PremiumLandingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasAccessToken = Boolean(localStorage.getItem("wee_access_token"));
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [autoTransactionId, setAutoTransactionId] = useState("");

  useEffect(() => {
    const transactionId = searchParams.get("_ptxn");
    if (!transactionId) return;
    if (!hasAccessToken) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("_ptxn");
      setSearchParams(nextParams, { replace: true });
      return;
    }
    setAutoTransactionId(transactionId);
    setIsCheckoutOpen(true);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("_ptxn");
    setSearchParams(nextParams, { replace: true });
  }, [hasAccessToken, searchParams, setSearchParams]);

  const handlePurchase = () => {
    if (!hasAccessToken) return;
    setAutoTransactionId("");
    setIsCheckoutOpen(true);
  };

  return (
    <MobileLayout>
      <main className="mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-white px-6 pb-8 text-[#353331]">
        <header className="flex h-[72px] items-center justify-between">
          <Link to="/home" aria-label="WEE 홈" className="inline-flex items-center">
            <img
              src={weeLogo}
              alt="WEE"
              className="h-6 w-auto"
              style={{ filter: "brightness(0) saturate(100%) invert(80%) sepia(28%) saturate(1492%) hue-rotate(154deg) brightness(101%) contrast(101%)" }}
            />
          </Link>
        </header>

        <section className="rounded-[24px] bg-[#EAFBFE] px-6 py-8 text-center">
          <p className="text-sm font-semibold tracking-[0.08em] text-[#52BFD8]">WEE PREMIUM</p>
          <h1 className="mt-3 text-[28px] font-bold leading-[1.35] tracking-[-0.84px]">
            날씨에 맞춘 하루를<br />더 편하게 준비해요
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#797776]">
            내 생활 패턴에 맞는 날씨 기반 알림으로 외출과 일상을 준비하세요.
          </p>
        </section>

        <section className="mt-8" aria-labelledby="premium-benefits-heading">
          <h2 id="premium-benefits-heading" className="text-lg font-bold">프리미엄 기능</h2>
          <ul className="mt-4 space-y-3">
            {benefits.map(([title, description]) => (
              <li key={title} className="rounded-2xl border border-[#E9E8E8] px-4 py-4">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-5 text-[#797776]">{description}</p>
              </li>
            ))}
          </ul>
        </section>

        {hasAccessToken ? (
          <section className="mt-8 rounded-2xl bg-[#F7F7F7] p-5 text-center" aria-label="상품 가격 및 이용 기간">
            <h2 className="text-lg font-bold">{PREMIUM_PLAN.name}</h2>
            <p className="mt-3 text-[28px] font-bold">{PREMIUM_PLAN.priceLabel}</p>
            <p className="mt-2 text-sm text-[#62605F]">일회성 결제 · 결제 후 21일 이용</p>
            <p className="mt-1 text-xs text-[#8F8E8D]">구독 및 자동 갱신이 아닙니다.</p>
            <Button onClick={handlePurchase} className="mt-5 h-11 rounded-[10px] text-base">
              프리미엄 이용하기
            </Button>
            <p className="mt-3 text-xs leading-5 text-[#8F8E8D]">
              결제 진행 시 Paddle Checkout으로 이동합니다. Paddle은 결제 처리자(Merchant of Record)입니다.
            </p>
          </section>
        ) : (
          <section className="mt-8 rounded-2xl border border-[#D9F4FA] bg-[#F5FCFD] p-5" aria-label="프리미엄 이용 안내">
            <h2 className="text-base font-bold">프리미엄 기능 안내</h2>
            <p className="mt-2 text-sm leading-6 text-[#62605F]">
              프리미엄은 로그인 후 구독할 수 있어요. 구독하면 내 위치와 생활 일정에 맞춘
              옷차림·운동·빨래·우산 알림을 받아볼 수 있습니다.
            </p>
          </section>
        )}

        <nav aria-label="정책 및 고객지원" className="mt-auto flex flex-wrap justify-center gap-x-4 gap-y-2 pt-8 text-xs text-[#797776]">
          {legalLinks.map(([label, href]) => <Link key={href} to={href} className="underline underline-offset-2">{label}</Link>)}
        </nav>

        {isCheckoutOpen && (
          <PremiumCheckoutSheet
            isOpen
            initialTransactionId={autoTransactionId}
            onClose={() => {
              setIsCheckoutOpen(false);
              setAutoTransactionId("");
            }}
            onSuccess={() => navigate("/premium/welcome")}
          />
        )}
      </main>
    </MobileLayout>
  );
}
