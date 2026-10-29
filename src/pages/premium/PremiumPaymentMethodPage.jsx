import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import { PREMIUM_PLAN } from "../../constants/premium";
import chevronRight from "../../assets/icons/chevron-right.svg";
import {
  useCreatePremiumCheckout,
  useRedirectIfPremium,
} from "../../hooks/usePayment";
import usePaddleCheckout from "../../hooks/usePaddleCheckout";

export default function PremiumPaymentMethodPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLocalPreview =
    import.meta.env.DEV &&
    new URLSearchParams(location.search).get("preview") === "1";
  const [paymentError, setPaymentError] = useState("");
  const [pendingTransactionId, setPendingTransactionId] = useState("");
  const {
    open: openCheckout,
    ready,
    loading,
    error: paddleError,
  } = usePaddleCheckout();
  const createCheckout = useCreatePremiumCheckout();
  const hasAccessToken = Boolean(localStorage.getItem("wee_access_token"));
  const { isChecking } = useRedirectIfPremium({
    enabled: hasAccessToken && !isLocalPreview,
  });

  useEffect(() => {
    const handleCheckoutCompleted = (event) => {
      const result = event.detail;
      if (
        !pendingTransactionId ||
        (result.transactionId && result.transactionId !== pendingTransactionId)
      )
        return;
      setPendingTransactionId("");
      if (result.status?.subscription?.active) {
        navigate("/premium/welcome", { replace: true });
      } else {
        setPaymentError(
          result.error?.message ??
            "결제는 접수됐어요. 프리미엄 이용 상태를 잠시 후 다시 확인해 주세요.",
        );
      }
    };
    window.addEventListener(
      "wee:paddle-checkout-completed",
      handleCheckoutCompleted,
    );
    return () =>
      window.removeEventListener(
        "wee:paddle-checkout-completed",
        handleCheckoutCompleted,
      );
  }, [navigate, pendingTransactionId]);

  const handlePaddleCheckout = async () => {
    if (isLocalPreview || isChecking || !ready || createCheckout.isPending)
      return;
    setPaymentError("");
    try {
      const checkout = await createCheckout.mutateAsync();
      if (!checkout?.transactionId)
        throw new Error("결제 거래 번호를 받지 못했어요. 다시 시도해 주세요.");
      setPendingTransactionId(checkout.transactionId);
      await openCheckout({ transactionId: checkout.transactionId });
    } catch (error) {
      setPendingTransactionId("");
      setPaymentError(
        error.response?.data?.detail ??
          (error.response?.status === 401
            ? "로그인 정보가 만료됐어요. 다시 로그인해 주세요."
            : error?.message || "결제창을 열지 못했어요. 다시 시도해 주세요."),
      );
    }
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] bg-white px-[21px] pt-[73px] text-[#353331]">
        <Header back />
        <h1 className="ml-[6px] mt-[15px] text-[28px] font-semibold leading-[1.4] tracking-[-0.84px]">
          결제 방법 선택
        </h1>
        <p className="ml-[1px] mt-[7px] text-[18px] font-medium leading-[1.38] tracking-[-0.54px] text-[#A5A4A3]">
          {PREMIUM_PLAN.name}: 2,500원
        </p>

        <p className="mt-[29px] whitespace-nowrap text-center text-[16px] font-medium leading-6 tracking-[-0.48px] text-[#4BDDFF]">
          입금 확인 후 프리미엄 기능이 활성화됩니다!
        </p>

        <div className="mt-[12px] space-y-[15px]">
          <button
            type="button"
            onClick={handlePaddleCheckout}
            disabled={
              isLocalPreview ||
              isChecking ||
              !ready ||
              loading ||
              createCheckout.isPending
            }
            className="relative flex h-[88px] w-full flex-col items-start rounded-[13px] border-[1.5px] border-[#E9E8E8] px-[16px] pt-[15px] text-left disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="block text-[16px] font-bold leading-[19.296px] tracking-[-0.43px]">
                Paddle 결제
            </span>
            <span className="mt-[11px] block whitespace-nowrap text-[12px] leading-[19.296px] tracking-[-0.43px]">
                {isLocalPreview
                  ? "미리보기에서는 실제 결제를 진행하지 않아요."
                  : loading || createCheckout.isPending
                    ? "Paddle 결제를 준비하고 있어요."
                    : "카드와 간편결제로 바로 시작하세요"}
            </span>
            <img src={chevronRight} alt="" aria-hidden="true" className="absolute right-[17px] top-[31px]" />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                isLocalPreview
                  ? "/premium/bank-transfer?preview=1"
                  : "/premium/bank-transfer",
                {
                  state: { bankTransferPreview: true },
                },
              )
            }
            className="relative flex h-[88px] w-full flex-col items-start rounded-[13px] border-[1.5px] border-[#E9E8E8] px-[16px] pt-[15px] text-left"
          >
            <span className="block text-[16px] font-bold leading-[19.296px] tracking-[-0.43px]">계좌이체</span>
            <span className="mt-[11px] block whitespace-nowrap text-[12px] leading-[19.296px] tracking-[-0.43px]">
              직접 이체하고 Premium 이용에 필요한 설문을 먼저 작성해요.
            </span>
            <img src={chevronRight} alt="" aria-hidden="true" className="absolute right-[17px] top-[31px]" />
          </button>
        </div>

        {(paymentError || paddleError || pendingTransactionId) && (
          <p
            role={paymentError || paddleError ? "alert" : "status"}
            aria-live="polite"
            className="mt-5 text-[14px] leading-6 text-[#797776]"
          >
            {paymentError ||
              paddleError ||
              "Paddle 결제 완료를 확인하고 있어요. 프리미엄 권한이 반영되면 다음 화면으로 이동합니다."}
          </p>
        )}
      </main>
    </MobileLayout>
  );
}
