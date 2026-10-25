import { useEffect, useRef, useState } from "react";
import BottomSheet from "./BottomSheet";
import Button from "./Button";
import { PREMIUM_PLAN } from "../constants/premium";
import { useCreatePremiumCheckout, useRefreshPremiumStatus } from "../hooks/usePayment";
import usePaddleCheckout from "../hooks/usePaddleCheckout";
import premiumCharacter from "../assets/images/premium-checkout/premium-alert-mascot.png";

export default function PremiumCheckoutSheet({ isOpen, onClose, onSuccess, initialTransactionId = "" }) {
  const [paymentError, setPaymentError] = useState("");
  const [pendingTransactionId, setPendingTransactionId] = useState(null);
  const autoOpenedTransactionId = useRef("");
  const { open: openCheckout, ready, loading, error: paddleError } = usePaddleCheckout();
  const createCheckout = useCreatePremiumCheckout();
  const refreshStatus = useRefreshPremiumStatus();

  useEffect(() => {
    if (!isOpen || !ready || !initialTransactionId || autoOpenedTransactionId.current === initialTransactionId) return;
    autoOpenedTransactionId.current = initialTransactionId;
    setPaymentError("");
    setPendingTransactionId(initialTransactionId);
    openCheckout({ transactionId: initialTransactionId }).catch((error) => {
      setPendingTransactionId(null);
      setPaymentError(error?.message || "결제창을 열지 못했어요. 다시 시도해 주세요.");
    });
  }, [initialTransactionId, isOpen, openCheckout, ready]);

  const handlePayment = async () => {
    setPaymentError("");
    try {
      const checkout = await createCheckout.mutateAsync();
      if (!checkout?.transactionId) throw new Error("결제 거래 번호를 받지 못했어요. 다시 시도해 주세요.");
      const result = await openCheckout({ transactionId: checkout.transactionId });
      if (result.status === "completed") {
        const status = await refreshStatus.mutateAsync();
        if (!status?.subscription?.active) {
          throw new Error("결제가 완료됐지만 이용권 반영을 확인하지 못했어요. 잠시 후 다시 확인해 주세요.");
        }
        onSuccess?.();
        return;
      }
      setPendingTransactionId(checkout.transactionId);
    } catch (error) {
      setPaymentError(
        error.response?.data?.detail ??
          (error.response?.status === 401
            ? "로그인 정보가 만료됐어요. 다시 로그인해 주세요."
            : error?.message || "결제 중 문제가 발생했어요. 다시 시도해 주세요."),
      );
    }
  };

  useEffect(() => {
    const handleCheckoutCompleted = (event) => {
      const result = event.detail;
      if (!pendingTransactionId) return;
      if (result.transactionId && result.transactionId !== pendingTransactionId) return;
      setPendingTransactionId(null);
      if (result.status?.subscription?.active) {
        onSuccess?.();
      } else {
        setPaymentError(
          result.error?.message ??
            "결제가 완료됐지만 이용권 반영을 확인하지 못했어요. 잠시 후 다시 확인해 주세요.",
        );
      }
    };
    window.addEventListener("wee:paddle-checkout-completed", handleCheckoutCompleted);
    return () => window.removeEventListener("wee:paddle-checkout-completed", handleCheckoutCompleted);
  }, [onSuccess, pendingTransactionId]);

  return (
    <BottomSheet
      isOpen={isOpen}
      title="Wee 결제"
      onClose={onClose}
      showHandle={false}
      showHeader={false}
      hideScrollbar
      backdropClassName="bg-[#D9D9D9]/75"
      className="!h-[319px] !max-h-none !rounded-t-[30px] !bg-[rgba(67,67,67,0.4)] !px-[27px] !pb-[29px] !pt-[25px] !shadow-none"
    >
      <div className="mb-[26px] flex h-[38px] items-center justify-between">
        <h2 className="text-[26px] font-semibold leading-[1.2] tracking-[-0.78px] text-white">
          Wee 결제
        </h2>
        <button
          type="button"
          aria-label="결제창 닫기"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-[12px] font-semibold leading-none text-[#8F8E8D]"
        >
          ×
        </button>
      </div>

      <div className="-mb-6 mx-[9px] min-h-[201px] rounded-[20px] bg-[#575757]/60 px-[28px] pb-4 pt-[14px]">
        <div className="flex min-h-[58px] items-center gap-3">
          <img
            src={premiumCharacter}
            alt=""
            className="h-[58px] w-[50px] shrink-0 object-contain"
          />
          <p className="text-[14px] font-medium leading-[1.5] tracking-[-0.28px] text-white">
            WEE Premium으로<br />맞춤형 행동 알림을 받아보세요.
          </p>
        </div>
        <div className="mt-[8px] border-t border-white/50 pt-[6px]">
          <p className="text-[14px] font-semibold leading-5 tracking-[-0.28px] text-white">
            {PREMIUM_PLAN.priceLabel}
          </p>
          <p className="text-[12px] leading-[18px] tracking-[-0.24px] text-white">
            21일 이용권 · 일회성 결제 · 자동 갱신 없음
          </p>
        </div>
        {paymentError && (
          <p role="alert" className="mt-2 text-center text-[11px] leading-4 text-white">
            {paymentError}
          </p>
        )}
        {!paymentError && paddleError && (
          <p role="alert" className="mt-2 text-center text-[11px] leading-4 text-white">{paddleError}</p>
        )}
        <Button
          variant="white"
          onClick={handlePayment}
          disabled={!ready || loading || createCheckout.isPending || refreshStatus.isPending}
          className="mx-auto mt-[12px] !h-[38px] !w-[240px] rounded-[7px] text-[14px] font-semibold tracking-[-0.14px] disabled:opacity-60"
        >
          {loading || createCheckout.isPending || refreshStatus.isPending ? "결제 중..." : "Wee 결제하기"}
        </Button>
      </div>
    </BottomSheet>
  );
}
