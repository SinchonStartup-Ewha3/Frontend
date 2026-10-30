import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Button from "../../components/Button";
import MobileLayout from "../../components/MobileLayout";
import {
  usePremiumBillingQuery,
  useRefundRequestQuery,
  useSubscriptionQuery,
} from "../../hooks/usePayment";
import {
  PREMIUM_BANK_TRANSFER_PENDING_KEY,
  PREMIUM_PLAN,
} from "../../constants/premium";
import { fetchMyFortunePurchases } from "../../api/fortune";
import queryKeys from "../../api/queryKeys";

const cardClassName =
  "flex w-full flex-col gap-[15px] rounded-[13px] border-[1.5px] border-[#E9E8E8] bg-white px-4 py-[19px]";
const readPendingTransfer = () => {
  try {
    return JSON.parse(
      localStorage.getItem(PREMIUM_BANK_TRANSFER_PENDING_KEY) ?? "null",
    );
  } catch {
    return null;
  }
};
const inactiveStatusMessages = {
  PENDING: "입금 확인 중",
  FAILED: "결제에 실패했어요.",
  CANCELED: "결제가 취소되었어요.",
  PARTIALLY_REFUNDED: "일부 환불 처리되었어요.",
  REFUNDED: "환불이 완료되었어요.",
  CHARGEBACK: "결제가 취소되었어요.",
};
const formatFortuneDate = (value) =>
  typeof value === "string" && value.length >= 10
    ? value.slice(0, 10).replaceAll("-", ".")
    : null;
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
  const location = useLocation();
  const [pendingTransfer, setPendingTransfer] = useState(readPendingTransfer);
  const { data, isLoading, isError } = usePremiumBillingQuery();
  const entitlementQuery = useSubscriptionQuery({ refetchOnMount: "always" });
  const { data: refundRequest } = useRefundRequestQuery();
  const fortunePurchasesQuery = useQuery({
    queryKey: queryKeys.fortunePurchases,
    queryFn: fetchMyFortunePurchases,
    retry: false,
  });
  const fortunePurchases = fortunePurchasesQuery.data;
  const hasFortuneVoucher = Boolean(
    fortunePurchases?.current ||
    fortunePurchases?.latest ||
    fortunePurchases?.upcoming?.length,
  );
  const activeFortunePurchase =
    fortunePurchases?.current ??
    fortunePurchases?.latest ??
    fortunePurchases?.upcoming?.[0];
  const activeFrom = formatFortuneDate(activeFortunePurchase?.active_from);
  const activeUntil = formatFortuneDate(activeFortunePurchase?.active_until);
  const redeemedAt = formatFortuneRedeemedAt(
    activeFortunePurchase?.redeemed_at,
  );
  const fortuneUsageCount =
    activeFortunePurchase?.usage_count ??
    activeFortunePurchase?.remaining_uses ??
    activeFortunePurchase?.remaining_count;
  const subscription = data?.subscription;
  const isActive =
    entitlementQuery.data?.subscription?.active ??
    subscription?.isActive ??
    subscription?.active;
  const isCheckingEntitlement =
    entitlementQuery.isLoading || entitlementQuery.isFetching;
  const isTransferPending =
    !isActive &&
    (pendingTransfer?.status === "PENDING" ||
      location.state?.bankTransferManual === true ||
      location.state?.bankTransferPreview === true ||
      subscription?.status === "PENDING");
  const canPurchasePremium =
    !isLoading &&
    !isError &&
    !entitlementQuery.isError &&
    !isCheckingEntitlement &&
    !isActive &&
    !isTransferPending;
  const canRequestRefund = Boolean(subscription?.canRequestRefund);
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

  useEffect(() => {
    if (!isActive) return;
    localStorage.removeItem(PREMIUM_BANK_TRANSFER_PENDING_KEY);
    setPendingTransfer(null);
  }, [isActive]);

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] overflow-hidden bg-white text-[#353331]">
        <div className="absolute left-5 right-5 top-[73px] z-10">
          <Header back />
        </div>

        <section className="px-[21px] pt-[114px]">
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
            ) : isTransferPending ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/premium/bank-transfer/pending")}
                  className="self-start text-left text-[14px] leading-[19.296px] tracking-[-0.4288px]"
                >
                  결제 상태 확인
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/mypage/refund")}
                  className="self-start text-[14px] leading-[21px] tracking-[-0.43px] text-[#F35C4B]"
                >
                  환불 신청
                </button>
              </>
            ) : isActive && !subscription ? (
              <p className="text-[14px] leading-[21px] text-[#19BBD8]">
                프리미엄 이용 중
              </p>
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
                {isActive && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/premium/payment/status", {
                        state: {
                          paymentProvider:
                            subscription?.paymentProvider ??
                            subscription?.payment_method ??
                            subscription?.provider ??
                            "Paddle",
                        },
                      })
                    }
                    className="self-start text-[14px] leading-[21px] tracking-[-0.43px]"
                  >
                    결제 상태 확인
                  </button>
                )}
                {refundRequest ? (
                  <button
                    type="button"
                    onClick={() => navigate("/mypage/refund")}
                    className="self-start text-[14px] leading-[21px] tracking-[-0.43px] text-[#F35C4B]"
                  >
                    환불 상태 확인
                  </button>
                ) : isActive && canRequestRefund ? (
                  <button
                    type="button"
                    onClick={() => navigate("/mypage/refund")}
                    className="self-start text-[14px] leading-[21px] tracking-[-0.43px] text-[#F35C4B]"
                  >
                    환불 신청
                  </button>
                ) : isActive && !canRequestRefund ? (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px] text-[#A5A4A3]">
                    환불 요청이 불가능한 이용권이에요.
                  </p>
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
                {fortuneUsageCount != null && (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
                    사용 횟수 | {fortuneUsageCount}회
                  </p>
                )}
                {activeFortunePurchase?.product_title && (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
                    이용권 | {activeFortunePurchase.product_title}
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
                    이용 기간 | {activeFrom ?? "-"} ~ {activeUntil ?? "-"}
                  </p>
                )}
                {redeemedAt && (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
                    이용권 등록일 | {redeemedAt}
                  </p>
                )}
                {!hasFortuneVoucher && (
                  <p className="text-[13px] leading-[19px] text-[#797776]">
                    등록된 운세 쿠폰 이용권이 없어요.
                  </p>
                )}
              </>
            )}
          </article>
        </section>
      </main>
    </MobileLayout>
  );
}
