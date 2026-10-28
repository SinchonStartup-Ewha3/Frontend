import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
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
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const hasAccessToken = Boolean(localStorage.getItem("wee_access_token"));
  const statusQuery = useSubscriptionQuery({ enabled: hasAccessToken, refetchOnMount: "always" });
  const [pendingTransfer, setPendingTransfer] = useState(readPendingTransfer);
  const [refreshMessage, setRefreshMessage] = useState("");
  const isPremium = Boolean(statusQuery.data?.subscription?.active);
  const depositorName = state?.depositorName ?? pendingTransfer?.depositorName;
  const createdAt = pendingTransfer?.createdAt
    ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "short", timeStyle: "short" }).format(new Date(pendingTransfer.createdAt))
    : null;

  useEffect(() => {
    if (!isPremium || statusQuery.isFetching) return;
    localStorage.removeItem(PREMIUM_BANK_TRANSFER_PENDING_KEY);
    setPendingTransfer(null);
    navigate("/premium/schedule-setup", { replace: true });
  }, [isPremium, navigate, statusQuery.isFetching]);

  const checkDepositStatus = async () => {
    setRefreshMessage("");
    if (!hasAccessToken) {
      setRefreshMessage("로그인이 필요해요. 다시 로그인해 주세요.");
      return;
    }
    const result = await statusQuery.refetch();
    if (!result.data?.subscription?.active) setRefreshMessage("아직 입금 확인이 완료되지 않았어요.");
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] bg-white px-6 pt-[73px] text-[#353331]">
        <Header back />
        <h1 className="mt-10 text-[26px] font-semibold leading-[1.4] tracking-[-0.78px]">
          입금 확인 중
        </h1>

        <section className="mt-6 rounded-[16px] border border-[#E9E8E8] p-5" aria-label="입금 확인 상태">
          <span className="inline-flex rounded-full bg-[#E5F9FD] px-3 py-1 text-[14px] font-semibold text-[#19BBD8]">
            확인 대기
          </span>
          <h2 className="mt-4 text-[18px] font-semibold">입금 확인을 기다리고 있어요.</h2>
          <dl className="mt-4 space-y-2 text-[14px] leading-5 text-[#797776]">
            {depositorName && (
              <div className="flex gap-4"><dt className="w-[64px] shrink-0">입금자명</dt><dd>{depositorName}</dd></div>
            )}
            <div className="flex gap-4"><dt className="w-[64px] shrink-0">입금 금액</dt><dd>{PREMIUM_PLAN.priceLabel}</dd></div>
            {createdAt && (
              <div className="flex gap-4"><dt className="w-[64px] shrink-0">신청 시각</dt><dd>{createdAt}</dd></div>
            )}
          </dl>
          <p className="mt-5 border-t border-[#E9E8E8] pt-4 text-[13px] leading-5 text-[#A5A4A3]">
            입금 확인 전까지 프리미엄 기능은 잠겨 있어요.
          </p>
        </section>

        <section className="mt-6 rounded-[16px] border border-[#E9E8E8] p-4" aria-label="입금 신청 관리">
          <Button
            onClick={checkDepositStatus}
            disabled={statusQuery.isFetching}
            className="h-[44px] rounded-[10px] text-[16px]"
          >
            {statusQuery.isFetching ? "상태 확인 중..." : "입금 상태 새로고침"}
          </Button>
          {refreshMessage && <p role="status" className="text-center text-[12px] text-[#797776]">{refreshMessage}</p>}
          <Button
            variant="white"
            onClick={() => navigate("/mypage/refund", { state: { fromBankTransferPending: true } })}
            className="mt-3 h-[44px] rounded-[10px] border border-[#E9E8E8] text-[16px] text-[#797776]"
          >
            신청 취소하기
          </Button>
        </section>

        <div className="mt-4 space-y-1">
          <button type="button" onClick={() => navigate("/mypage/payment")} className="w-full py-2 text-[14px] text-[#797776] underline underline-offset-2">
            결제 관리에서 상태 보기
          </button>
          <button type="button" onClick={() => navigate("/home")} className="w-full py-2 text-[14px] text-[#797776] underline underline-offset-2">
            홈으로
          </button>
        </div>
      </main>
    </MobileLayout>
  );
}
