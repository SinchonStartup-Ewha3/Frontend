import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import { PREMIUM_BANK_TRANSFER_PENDING_KEY, PREMIUM_PLAN } from "../../constants/premium";
import { useSubscriptionQuery } from "../../hooks/usePayment";

const readPendingTransfer = () => {
  try {
    return JSON.parse(localStorage.getItem(PREMIUM_BANK_TRANSFER_PENDING_KEY) ?? "null");
  } catch {
    return null;
  }
};

export default function PremiumDepositPendingPage() {
  const location = useLocation();
  const { state } = location;
  const hasAccessToken = Boolean(localStorage.getItem("wee_access_token"));
  const statusQuery = useSubscriptionQuery({ enabled: hasAccessToken, refetchOnMount: "always" });
  const [pendingTransfer] = useState(readPendingTransfer);
  const isPremium = Boolean(statusQuery.data?.subscription?.active);
  const subscription = statusQuery.data?.subscription;
  const paymentProvider = state?.paymentProvider ?? subscription?.paymentMethod ?? subscription?.paymentProvider ?? subscription?.payment_method ?? subscription?.provider ?? "";
  const isBankTransfer = location.pathname.includes("bank-transfer") || Boolean(pendingTransfer) || state?.bankTransferManual || /bank|transfer|계좌/i.test(String(paymentProvider));
  const approvalDateValue = isPremium
    ? subscription?.paidAt ?? subscription?.purchasedAt ?? subscription?.paid_at
    : pendingTransfer?.createdAt ?? state?.createdAt;
  const approvalDate = approvalDateValue
    ? new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date(approvalDateValue)).replaceAll("-", ".")
    : "확인 중";

  useEffect(() => {
    if (isPremium) localStorage.removeItem(PREMIUM_BANK_TRANSFER_PENDING_KEY);
  }, [isPremium]);

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] bg-white px-[21px] pt-[73px] text-[#353331]">
        <Header back />
        <h1 className="ml-[6px] mt-[15px] text-[28px] font-semibold leading-[1.4] tracking-[-0.84px]">
          결제 상태 확인
        </h1>

        <section className="mt-[25px] flex flex-col items-start gap-[15px] rounded-[13px] border-[1.5px] border-[#E9E8E8] px-4 py-[19px]" aria-label="계좌 이체 결제 상태">
          <h2 className="text-[16px] font-bold leading-[21.44px] tracking-[-0.4288px]">{isBankTransfer ? "계좌 이체" : "PayApp"}</h2>
          <p className="text-[14px] leading-[21.44px] tracking-[-0.4288px]">
            결제 상태 | <span className={isBankTransfer ? (isPremium ? "font-medium text-[#4BDDFF]" : "text-[#F35C4B]") : ""}>{isPremium ? (isBankTransfer ? "확인 완료" : "완료") : "확인 중"}</span>
          </p>
          <p className="text-[14px] leading-[21.44px] tracking-[-0.4288px]">결제 승인일 | {approvalDate}</p>
          <p className="text-[14px] leading-[21.44px] tracking-[-0.4288px]">{isBankTransfer ? "입금 금액" : "결제 금액"} | {PREMIUM_PLAN.priceLabel}</p>
        </section>
      </main>
    </MobileLayout>
  );
}
