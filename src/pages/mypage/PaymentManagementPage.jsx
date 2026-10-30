import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Button from "../../components/Button";
import MobileLayout from "../../components/MobileLayout";
import {
  usePremiumBillingQuery,
  useRefundRequestQuery,
  useSubscriptionQuery,
} from "../../hooks/usePayment";
import { PREMIUM_PLAN } from "../../constants/premium";
import FortunePaymentSheet from "../../components/FortunePaymentSheet";
import { useFortunePurchasesQuery } from "../../hooks/useFortunePayment";
import {
  FORTUNE_PAYMENT_METHOD_LABELS,
  FORTUNE_REFUND_STATUS_LABELS,
  canRequestFortuneRefund,
  formatDotDate,
} from "../../constants/fortune";

const cardClassName =
  "flex w-full flex-col gap-[15px] rounded-[13px] border-[1.5px] border-[#E9E8E8] bg-white px-4 py-[19px]";
const inactiveStatusMessages = {
  PENDING: "결제 확인 중",
  FAILED: "결제에 실패했어요.",
  CANCELED: "결제가 취소되었어요.",
  PARTIALLY_REFUNDED: "일부 환불 처리되었어요.",
  REFUNDED: "환불이 완료되었어요.",
  CHARGEBACK: "결제가 취소되었어요.",
};
const formatFortuneRedeemedAt = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export default function PaymentManagementPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePremiumBillingQuery();
  const entitlementQuery = useSubscriptionQuery({ refetchOnMount: "always" });
  const { data: refundRequest } = useRefundRequestQuery();
  const [isFortunePaymentOpen, setIsFortunePaymentOpen] = useState(false);
  const fortunePurchasesQuery = useFortunePurchasesQuery();
  const fortunePurchases = fortunePurchasesQuery.data;
  const currentFortunePass = fortunePurchases?.current;
  const activeFortunePurchase =
    currentFortunePass ??
    fortunePurchases?.latest ??
    fortunePurchases?.upcoming?.[0];
  const hasFortuneVoucher = Boolean(activeFortunePurchase);
  const fortuneCoins = currentFortunePass ? fortunePurchases?.coins : null;
  const fortuneRefundStatus = activeFortunePurchase?.refund_status;
  const canRefundFortune = canRequestFortuneRefund(currentFortunePass);
  // 이용 중인 이용권이 있으면 서버가 새 결제를 막아요 -> 버튼도 숨김
  const canBuyFortune = !currentFortunePass;
  const activeFrom = formatDotDate(activeFortunePurchase?.active_from);
  const activeUntil = formatDotDate(activeFortunePurchase?.active_until);
  const redeemedAt = formatFortuneRedeemedAt(
    activeFortunePurchase?.redeemed_at,
  );
  const isCouponPass = activeFortunePurchase?.payment_method === "COUPON";
  const subscription = data?.subscription;
  const isActive =
    entitlementQuery.data?.subscription?.active ??
    subscription?.isActive ??
    subscription?.active;
  const isCheckingEntitlement =
    entitlementQuery.isLoading || entitlementQuery.isFetching;
  const canPurchasePremium =
    !isLoading &&
    !isError &&
    !entitlementQuery.isError &&
    !isCheckingEntitlement &&
    !isActive;
  const purchasedAt = subscription?.purchasedAt ?? subscription?.paidAt;
  const paidAt = purchasedAt
    ? purchasedAt.slice(0, 10).replaceAll("-", ".")
    : subscription?.nextPaymentAt;
  const expiresAt = subscription?.expiresAt ?? subscription?.premiumExpiresAt;
  const expiresAtDisplay = expiresAt
    ? new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(expiresAt))
    : null;

  return (
    <MobileLayout>
      <main className="relative mx-auto flex min-h-screen w-full max-w-[402px] flex-col overflow-hidden bg-white text-[#353331]">
        <div className="absolute left-5 right-5 top-[73px] z-10">
          <Header back />
        </div>

        <section className="flex min-h-screen flex-1 flex-col px-[21px] pt-[114px]">
          <h1 className="ml-[6px] text-[24px] font-semibold leading-[1.4] tracking-[-0.72px]">
            맞춤형 행동 알림 구독
          </h1>

          <article className={`${cardClassName} mt-[14px]`}>
            <h2 className="text-[16px] font-bold leading-[21px] tracking-[-0.43px]">
              {subscription?.productName ?? "맞춤형 행동 알림"}
            </h2>
            {isLoading ? (
              <p className="text-[14px] leading-[21px] text-[#797776]">
                구독 정보를 불러오는 중...
              </p>
            ) : isCheckingEntitlement ? (
              <p className="text-[14px] leading-[21px] text-[#797776]">
                프리미엄 이용 상태를 확인하는 중...
              </p>
            ) : entitlementQuery.isError ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] leading-[21px] text-[#797776]">
                  프리미엄 이용 상태를 확인하지 못했어요.
                </p>
                <button
                  type="button"
                  onClick={() => entitlementQuery.refetch()}
                  className="shrink-0 text-[14px] text-[#5ADCF4] underline"
                >
                  다시 시도
                </button>
              </div>
            ) : isError ? (
              <p className="text-[14px] leading-[21px] text-[#797776]">
                구독 정보를 불러오지 못했어요.
              </p>
            ) : isActive && !subscription ? (
              <>
                <p className="text-[14px] leading-[21px] text-[#19BBD8]">
                  프리미엄 이용 중
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/mypage/refund")}
                  className="self-start text-[14px] leading-[21px] tracking-[-0.43px] text-[#F35C4B]"
                >
                  환불 신청
                </button>
              </>
            ) : subscription ? (
              <>
                <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
                  결제일 | {paidAt ?? "정보 없음"}
                </p>
                <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
                  결제 금액 | {PREMIUM_PLAN.priceLabel}
                </p>
                {expiresAtDisplay && (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
                    이용 만료일 | {expiresAtDisplay}
                  </p>
                )}
                {refundRequest ? (
                  <button
                    type="button"
                    onClick={() => navigate("/mypage/refund")}
                    className="self-start text-[14px] leading-[21px] tracking-[-0.43px] text-[#F35C4B]"
                  >
                    환불 상태 확인
                  </button>
                ) : isActive ? (
                  <button
                    type="button"
                    onClick={() => navigate("/mypage/refund")}
                    className="self-start text-[14px] leading-[21px] tracking-[-0.43px] text-[#F35C4B]"
                  >
                    환불 신청
                  </button>
                ) : subscription.status === "COMPLETED" &&
                  subscription.remainingSeconds === 0 ? (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px] text-[#A5A4A3]">
                    이용 기간이 만료되었어요.
                  </p>
                ) : (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px] text-[#A5A4A3]">
                    {inactiveStatusMessages[subscription.status] ??
                      "현재 이용 중인 구독이 아니에요."}
                  </p>
                )}
                {canPurchasePremium && (
                  <Button
                    onClick={() => navigate("/premium/payment-method")}
                    className="h-[44px] rounded-[10px] text-[14px]"
                  >
                    프리미엄 구독 결제하러 가기
                  </Button>
                )}
              </>
            ) : (
              <>
                <p className="text-[14px] leading-[21px] text-[#797776]">
                  이용 중인 구독이 없어요.
                </p>
                {canPurchasePremium && (
                  <Button
                    onClick={() => navigate("/premium/payment-method")}
                    className="h-[44px] rounded-[10px] text-[14px]"
                  >
                    프리미엄 구독 결제하러 가기
                  </Button>
                )}
              </>
            )}
          </article>

          <h2 className="ml-[6px] mt-8 text-[24px] font-semibold leading-[1.4] tracking-[-0.72px]">
            날씨 운세 이용권
          </h2>
          <article className={`${cardClassName} mt-[14px]`}>
            <h3 className="text-[16px] font-bold leading-[21px] tracking-[-0.43px]">
              날씨 운세
            </h3>
            {fortunePurchasesQuery.isPending ? (
              <p className="text-[14px] leading-[21px] text-[#797776]">
                이용권 정보를 불러오는 중...
              </p>
            ) : fortunePurchasesQuery.isError ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] leading-[21px] text-[#797776]">
                  이용권 정보를 불러오지 못했어요.
                </p>
                <button
                  type="button"
                  onClick={() => fortunePurchasesQuery.refetch()}
                  className="shrink-0 text-[14px] text-[#5ADCF4] underline"
                >
                  다시 시도
                </button>
              </div>
            ) : (
              <>
                {fortuneCoins?.remaining != null && (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
                    남은 코인 | {fortuneCoins.remaining}
                    {fortuneCoins.total != null
                      ? ` / ${fortuneCoins.total}`
                      : ""}
                    개
                  </p>
                )}
                {activeFortunePurchase?.product_title && (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
                    이용권 | {activeFortunePurchase.product_title}
                  </p>
                )}
                {activeFortunePurchase?.payment_method && (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
                    결제 수단 |{" "}
                    {FORTUNE_PAYMENT_METHOD_LABELS[
                      activeFortunePurchase.payment_method
                    ] ?? activeFortunePurchase.payment_method}
                  </p>
                )}
                {activeFortunePurchase?.duration_days != null && (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
                    이용 기간 | {activeFortunePurchase.duration_days}일
                  </p>
                )}
                {activeFortunePurchase?.remaining_days != null && (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
                    남은 기간 | {activeFortunePurchase.remaining_days}일
                  </p>
                )}
                {(activeFrom || activeUntil) && (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
                    이용 일자 | {activeFrom ?? "-"} ~ {activeUntil ?? "-"}
                  </p>
                )}
                {redeemedAt && (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
                    {isCouponPass ? "코드 등록일" : "결제일"} | {redeemedAt}
                  </p>
                )}
                {!hasFortuneVoucher && (
                  <p className="text-[13px] leading-[19px] text-[#797776]">
                    등록된 운세 이용권이 없어요.
                  </p>
                )}
                {fortuneRefundStatus ? (
                  <button
                    type="button"
                    onClick={() => navigate("/mypage/fortune-refund")}
                    className="self-start text-[14px] leading-[21px] tracking-[-0.43px] text-[#F35C4B]"
                  >
                    환불 상태 확인 (
                    {FORTUNE_REFUND_STATUS_LABELS[fortuneRefundStatus] ??
                      fortuneRefundStatus}
                    )
                  </button>
                ) : canRefundFortune ? (
                  <button
                    type="button"
                    onClick={() => navigate("/mypage/fortune-refund")}
                    className="self-start text-[14px] leading-[21px] tracking-[-0.43px] text-[#F35C4B]"
                  >
                    환불 신청
                  </button>
                ) : currentFortunePass && isCouponPass ? (
                  <p className="text-[13px] leading-[19px] text-[#A5A4A3]">
                    쿠폰 이용권은 환불할 수 없어요.
                  </p>
                ) : null}
                {canBuyFortune && (
                  <Button
                    onClick={() => setIsFortunePaymentOpen(true)}
                    className="h-[44px] rounded-[10px] text-[14px]"
                  >
                    운세 이용권 결제하러 가기
                  </Button>
                )}
              </>
            )}
          </article>

          <footer
            aria-label="약관 및 문의"
            className="mt-auto flex flex-wrap justify-center gap-x-[12px] gap-y-2 border-t border-[#E9E8E8] py-5 text-[12px] leading-[18px] text-[#A5A4A3]"
          >
            <Link to="/terms" className="underline-offset-2 hover:underline">
              이용약관
            </Link>
            <Link to="/privacy" className="underline-offset-2 hover:underline">
              개인정보처리방침
            </Link>
            <Link to="/refund" className="underline-offset-2 hover:underline">
              환불정책
            </Link>
            <Link to="/contact" className="underline-offset-2 hover:underline">
              문의
            </Link>
          </footer>
        </section>
      </main>
      <FortunePaymentSheet
        isOpen={isFortunePaymentOpen}
        onClose={() => setIsFortunePaymentOpen(false)}
      />
    </MobileLayout>
  );
}
