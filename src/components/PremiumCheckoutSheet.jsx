import { useState } from "react";
import BottomSheet from "./BottomSheet";
import Button from "./Button";
import { PREMIUM_PLAN } from "../constants/premium";
import { useCreatePremiumCheckout, useRefreshPremiumStatus } from "../hooks/usePayment";
import usePaddleCheckout from "../hooks/usePaddleCheckout";
import { USE_MOCK } from "../api/config";
import premiumCharacter from "../assets/images/premium_character.svg";

export default function PremiumCheckoutSheet({ isOpen, onClose, onSuccess }) {
  const [paymentError, setPaymentError] = useState("");
  const { open: openCheckout, ready, loading } = usePaddleCheckout();
  const createCheckout = useCreatePremiumCheckout();
  const refreshStatus = useRefreshPremiumStatus();

  const handlePayment = async () => {
    setPaymentError("");
    const popup = USE_MOCK ? null : window.open("about:blank", "_blank");
    if (!USE_MOCK && !popup) {
      setPaymentError("결제창을 열 수 없어요. 브라우저에서 팝업을 허용해 주세요.");
      return;
    }
    try {
      const checkout = await createCheckout.mutateAsync();
      if (!checkout?.checkoutUrl) throw new Error("결제창 주소를 받지 못했어요. 다시 시도해 주세요.");
      const result = await openCheckout({ checkoutUrl: checkout.checkoutUrl, popup });
      if (result.status !== "completed") return;
      const status = await refreshStatus.mutateAsync();
      if (!status?.subscription?.active) {
        throw new Error("결제가 완료됐지만 이용권 반영을 확인하지 못했어요. 잠시 후 다시 확인해 주세요.");
      }
      onSuccess?.();
    } catch (error) {
      if (popup && !popup.closed) popup.close();
      setPaymentError(error?.message || "결제 중 문제가 발생했어요. 다시 시도해 주세요.");
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      title="Wee 결제"
      onClose={onClose}
      showHandle={false}
      showHeader={false}
      hideScrollbar
      backdropClassName="bg-[#D9D9D9]/75"
      className="!h-[319px] !max-h-none !rounded-t-[30px] !bg-[#555]/55 !px-7 !pb-7 !pt-[25px] !shadow-none"
    >
      <div className="mb-[30px] flex h-[38px] items-center justify-between">
        <h2 className="text-[26px] font-semibold leading-[1.2] tracking-[-0.78px] text-white">
          Wee 결제
        </h2>
        <button
          type="button"
          aria-label="결제창 닫기"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-[12px] leading-none text-[#797776]"
        >
          ×
        </button>
      </div>

      <div className="-mb-6 rounded-[20px] bg-[#555]/55 px-10 pb-6 pt-[18px]">
        <div className="flex h-[54px] items-center gap-3">
          <img
            src={premiumCharacter}
            alt=""
            className="h-[52px] w-[52px] shrink-0 object-contain"
          />
          <p className="text-[14px] font-medium leading-[1.5] tracking-[-0.28px] text-white">
            Wee 구독으로<br />맞춤형 행동 알림을 받아보세요.
          </p>
        </div>
        <div className="mt-[10px] border-t border-white/50 pt-[6px]">
          <p className="text-[14px] font-semibold leading-5 tracking-[-0.28px] text-white">
            {PREMIUM_PLAN.priceLabel}
          </p>
          <p className="mt-[2px] text-[12px] leading-[18px] tracking-[-0.24px] text-white">
            {PREMIUM_PLAN.periodLabel}
          </p>
        </div>
        {paymentError && (
          <p role="alert" className="mt-2 text-center text-xs text-white">
            {paymentError}
          </p>
        )}
        <Button
          variant="white"
          onClick={handlePayment}
          disabled={!ready || loading || createCheckout.isPending || refreshStatus.isPending}
          className="mt-[10px] h-[38px] rounded-[7px] text-[14px] font-semibold tracking-[-0.14px] disabled:opacity-60"
        >
          {loading || createCheckout.isPending || refreshStatus.isPending ? "결제 중..." : "Wee 결제하기"}
        </Button>
      </div>
    </BottomSheet>
  );
}
