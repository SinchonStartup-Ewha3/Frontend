import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import { PREMIUM_PLAN } from "../../constants/premium";
import chevronRight from "../../assets/icons/chevron-right.svg";
import { useCreatePayAppCheckout, useSubscriptionQuery } from "../../hooks/usePayment";

export default function PremiumPaymentMethodPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLocalPreview = import.meta.env.DEV && new URLSearchParams(location.search).get("preview") === "1";
  const hasAccessToken = Boolean(localStorage.getItem("wee_access_token"));
  const [recvphone, setRecvphone] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [pollAttempt, setPollAttempt] = useState(0);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const createCheckout = useCreatePayAppCheckout();
  const statusQuery = useSubscriptionQuery({ enabled: hasAccessToken && !isLocalPreview, refetchOnMount: "always" });
  const canCompleteSurvey = Boolean(statusQuery.data?.canCompleteSurvey);
  const isPremium = Boolean(statusQuery.data?.subscription?.active);
  const paymentMethod = statusQuery.data?.paymentMethod ?? statusQuery.data?.subscription?.paymentMethod;
  const isPayAppConfirmed = Boolean(statusQuery.data?.isPremium && paymentMethod === "PAYAPP");

  useEffect(() => {
    if (isLocalPreview || checkoutPending || statusQuery.isFetching) return;
    if (isPayAppConfirmed && canCompleteSurvey) navigate("/premium/survey", { replace: true });
    else if (canCompleteSurvey) navigate("/premium/survey", { replace: true });
    else if (isPremium) navigate("/premium", { replace: true });
  }, [canCompleteSurvey, checkoutPending, isLocalPreview, isPayAppConfirmed, isPremium, navigate, statusQuery.isFetching]);

  useEffect(() => {
    if (!checkoutPending || isLocalPreview) return undefined;
    if (pollAttempt > 0 && isPayAppConfirmed) {
      setCheckoutPending(false);
      setConfirmationMessage("");
      if (canCompleteSurvey) navigate("/premium/survey", { replace: true });
      else navigate("/premium", { replace: true });
      return undefined;
    }
    if (pollAttempt >= 10) {
      setCheckoutPending(false);
      setConfirmationMessage("결제 승인 정보를 아직 확인하지 못했어요. 결제는 접수되었을 수 있으니 잠시 후 다시 확인해 주세요.");
      return undefined;
    }
    const timer = window.setTimeout(async () => {
      await statusQuery.refetch();
      setPollAttempt((attempt) => attempt + 1);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [canCompleteSurvey, checkoutPending, isLocalPreview, isPayAppConfirmed, navigate, pollAttempt, statusQuery.refetch]);

  const handlePayAppCheckout = async () => {
    if (isLocalPreview || createCheckout.isPending) return;
    setPaymentError("");
    setConfirmationMessage("");
    const checkoutWindow = window.open("about:blank", "_blank");
    try {
      const checkout = await createCheckout.mutateAsync({ recvphone });
      if (!checkout?.paymentUrl) throw new Error("결제창 주소를 받지 못했어요. 다시 시도해 주세요.");
      setPollAttempt(0);
      setCheckoutPending(true);
      if (checkoutWindow) checkoutWindow.location.href = checkout.paymentUrl;
      else window.location.assign(checkout.paymentUrl);
    } catch (error) {
      checkoutWindow?.close();
      const data = error.response?.data;
      setPaymentError(data?.recvphone?.[0] ?? data?.detail ?? (error.response?.status === 401
        ? "로그인 정보가 만료됐어요. 다시 로그인해 주세요."
        : error.message || "결제 요청에 실패했어요. 다시 시도해 주세요."));
    }
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] bg-white px-[21px] pt-[73px] text-[#353331]">
        <Header back />
        <h1 className="ml-[6px] mt-[15px] text-[28px] font-semibold leading-[1.4] tracking-[-0.84px]">결제 방법 선택</h1>
        <p className="ml-[1px] mt-[7px] text-[18px] font-medium leading-[1.38] tracking-[-0.54px] text-[#A5A4A3]">{PREMIUM_PLAN.name}: 2,500원</p>

        <section className="mt-[24px] rounded-[13px] border-[1.5px] border-[#E9E8E8] px-4 py-4" aria-label="PayApp 휴대전화 번호 입력">
          <label htmlFor="payapp-phone" className="block text-[15px] font-bold">PayApp 결제</label>
          <p className="mt-2 text-[13px] leading-5 text-[#797776]">결제창에서 결제를 진행할 휴대전화 번호를 입력해 주세요.</p>
          <input id="payapp-phone" type="tel" inputMode="numeric" autoComplete="tel" maxLength={11} value={recvphone}
            onChange={(event) => setRecvphone(event.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="01012345678" className="mt-3 h-12 w-full rounded-[10px] border border-[#E9E8E8] px-3 text-[16px] outline-none focus:border-[#4BDDFF]" />
          <Button onClick={handlePayAppCheckout} disabled={isLocalPreview || statusQuery.isFetching || createCheckout.isPending || recvphone.length < 10}
            className="mt-3 h-12 rounded-[10px] text-base disabled:opacity-50">
            {isLocalPreview ? "미리보기에서는 결제할 수 없어요" : createCheckout.isPending ? "결제창을 준비하고 있어요" : "PayApp 결제하기"}
          </Button>
        </section>

        <button type="button" onClick={() => navigate(isLocalPreview ? "/premium/bank-transfer?preview=1" : "/premium/bank-transfer", { state: { bankTransferPreview: true } })}
          className="relative mt-[15px] flex h-[88px] w-full flex-col items-start rounded-[13px] border-[1.5px] border-[#E9E8E8] px-[16px] pt-[15px] text-left">
          <span className="block text-[16px] font-bold leading-[19.296px] tracking-[-0.43px]">계좌이체</span>
          <span className="mt-[11px] block whitespace-nowrap text-[12px] leading-[19.296px] tracking-[-0.43px]">직접 이체하고 프리미엄 설문을 먼저 작성해요.</span>
          <img src={chevronRight} alt="" aria-hidden="true" className="absolute right-[17px] top-[31px]" />
        </button>

        {(paymentError || checkoutPending || confirmationMessage) && <p role={paymentError ? "alert" : "status"} aria-live="polite" className="mt-5 text-[14px] leading-6 text-[#797776]">
          {paymentError || confirmationMessage || "결제 완료 후 Premium 권한이 부여됐는지 확인하고 있어요."}
        </p>}
        {confirmationMessage && <button type="button" onClick={() => { setConfirmationMessage(""); setPollAttempt(0); setCheckoutPending(true); }} className="mt-2 text-[14px] font-medium text-[#35BFD9]">결제 상태 다시 확인</button>}
      </main>
    </MobileLayout>
  );
}
