import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import { PREMIUM_PLAN } from "../../constants/premium";
import { useSubscriptionQuery } from "../../hooks/usePayment";

export default function PremiumDepositPendingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasAccessToken = Boolean(localStorage.getItem("wee_access_token"));
  const statusQuery = useSubscriptionQuery({ enabled: hasAccessToken, refetchOnMount: "always" });
  const [statusCheckCount, setStatusCheckCount] = useState(0);
  const isPremium = Boolean(statusQuery.data?.subscription?.active);
  const subscription = statusQuery.data?.subscription;
  const approvalDateValue = subscription?.paidAt ?? subscription?.purchasedAt ?? subscription?.paid_at;
  const approvalDate = approvalDateValue
    ? new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date(approvalDateValue)).replaceAll("-", ".")
    : "확인 중";

  // PayApp 승인 통보는 서버에서 확정되므로 복귀 직후 상태가 아직 갱신되지 않았다면 잠시 재조회해요.
  useEffect(() => {
    const isPayAppReturn = location.pathname === "/premium/payment/status";
    if (!isPayAppReturn || isPremium || statusCheckCount >= 10) return undefined;

    const timer = window.setTimeout(async () => {
      await statusQuery.refetch();
      setStatusCheckCount((count) => count + 1);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [isPremium, location.pathname, statusCheckCount, statusQuery.refetch]);

  useEffect(() => {
    if (location.pathname === "/premium/payment/status" && isPremium) {
      navigate("/premium/survey", { replace: true });
    }
  }, [isPremium, location.pathname, navigate]);

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] bg-white px-[21px] pt-[73px] text-[#353331]">
        <Header back />
        <h1 className="ml-[6px] mt-[15px] text-[28px] font-semibold leading-[1.4] tracking-[-0.84px]">
          결제 상태 확인
        </h1>

        <section className="mt-[25px] flex flex-col items-start gap-[15px] rounded-[13px] border-[1.5px] border-[#E9E8E8] px-4 py-[19px]" aria-label="PayApp 결제 상태">
          <h2 className="text-[16px] font-bold leading-[21.44px] tracking-[-0.4288px]">PayApp</h2>
          <p className="text-[14px] leading-[21.44px] tracking-[-0.4288px]">
            결제 상태 | <span>{isPremium ? "완료" : "확인 중"}</span>
          </p>
          <p className="text-[14px] leading-[21.44px] tracking-[-0.4288px]">결제 승인일 | {approvalDate}</p>
          <p className="text-[14px] leading-[21.44px] tracking-[-0.4288px]">결제 금액 | {PREMIUM_PLAN.priceLabel}</p>
        </section>
      </main>
    </MobileLayout>
  );
}
