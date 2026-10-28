import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import { PREMIUM_PLAN } from "../../constants/premium";
import premiumCharacter from "../../assets/images/premium-checkout/premium-alert-mascot.png";
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
      <main className="relative mx-auto flex min-h-[852px] w-full max-w-[402px] flex-col bg-white px-6 pb-8 pt-[73px] text-[#353331]">
        <Header back />
        <h1 className="mt-10 text-[26px] font-semibold leading-[1.4] tracking-[-0.78px]">
          결제 방법 선택
        </h1>
        <p className="mt-2 text-[16px] text-[#797776]">
          {PREMIUM_PLAN.name} · {PREMIUM_PLAN.priceLabel}
        </p>

        <section
          className="mt-6 flex items-center gap-3 rounded-[18px] bg-[#F0F0F0] px-4 py-3"
          aria-label="WEE Premium 안내"
        >
          <img
            src={premiumCharacter}
            alt=""
            aria-hidden="true"
            className="h-[54px] w-[46px] shrink-0 object-contain"
          />
          <p className="text-[14px] font-medium leading-[1.5] text-[#62605F]">
            WEE Premium으로
            <br />
            맞춤형 행동 알림을 받아보세요.
          </p>
        </section>

        <div className="mt-6 space-y-4">
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
            className="flex min-h-[96px] w-full items-center justify-between rounded-[16px] border border-[#E9E8E8] px-5 py-4 text-left disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              <span className="block text-[18px] font-semibold">
                Paddle 결제
              </span>
              <span className="mt-1 block text-[14px] text-[#797776]">
                {isLocalPreview
                  ? "미리보기에서는 실제 결제를 진행하지 않아요."
                  : loading || createCheckout.isPending
                    ? "Paddle 결제를 준비하고 있어요."
                    : "카드와 간편결제로 바로 시작해요."}
              </span>
            </span>
            <span aria-hidden="true" className="text-[28px] text-[#62605F]">
              ›
            </span>
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
            className="flex min-h-[96px] w-full items-center justify-between rounded-[16px] border border-[#E9E8E8] px-5 py-4 text-left"
          >
            <span>
              <span className="block text-[18px] font-semibold">계좌이체</span>
              <span className="mt-1 block text-[14px] text-[#797776]">
                입금 정보를 확인하고 설문을 작성해요.
              </span>
            </span>
            <span aria-hidden="true" className="text-[28px] text-[#62605F]">
              ›
            </span>
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
        <p className="mt-8 text-[14px] leading-6 text-[#A5A4A3]">
          {isLocalPreview
            ? "로컬 화면 미리보기입니다. 로그인한 실제 화면에서 Paddle Sandbox 결제를 진행할 수 있어요."
            : "결제 완료 후 서버에서 프리미엄 이용 상태를 확인합니다. 계좌이체는 운영자가 입금 내역을 확인해 수동으로 활성화합니다."}
        </p>
        <nav
          aria-label="정책 및 고객지원"
          className="mt-auto flex flex-wrap justify-center gap-x-4 gap-y-2 pt-10 text-xs text-[#797776]"
        >
          <Link to="/terms" className="underline underline-offset-2">
            이용약관
          </Link>
          <Link to="/privacy" className="underline underline-offset-2">
            개인정보처리방침
          </Link>
          <Link to="/refund" className="underline underline-offset-2">
            환불정책
          </Link>
          <Link to="/contact" className="underline underline-offset-2">
            문의
          </Link>
        </nav>
      </main>
    </MobileLayout>
  );
}
