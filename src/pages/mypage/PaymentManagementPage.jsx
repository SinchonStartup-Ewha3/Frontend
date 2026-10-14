import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import { useSubscriptionQuery } from "../../hooks/usePayment";
import { useNavigate } from "react-router-dom";

const cardClassName =
  "flex w-full flex-col gap-[15px] rounded-[13px] border-[1.5px] border-[#E9E8E8] bg-white px-4 py-[19px]";
const inactiveStatusMessages = {
  PENDING: "결제를 기다리고 있어요.",
  FAILED: "결제에 실패했어요.",
  CANCELED: "결제가 취소되었어요.",
  PARTIALLY_REFUNDED: "일부 환불 처리되었어요.",
  REFUNDED: "환불이 완료되었어요.",
  CHARGEBACK: "결제가 취소되었어요.",
};

export default function PaymentManagementPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useSubscriptionQuery();
  const subscription = data?.subscription;
  const fortunePass = data?.fortunePass;
  const isActive = subscription?.isActive ?? subscription?.active;
  const canRequestRefund = subscription?.canRequestRefund ?? isActive;
  const purchasedAt = subscription?.purchasedAt ?? subscription?.paidAt;
  const paidAt = purchasedAt
    ? purchasedAt.slice(0, 10).replaceAll("-", ".")
    : subscription?.nextPaymentAt;
  const usageCount = fortunePass?.remainingCount ?? fortunePass?.remainingUses;

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
              맞춤형 행동 알림
            </h2>
            {isLoading ? (
              <p className="text-[14px] leading-[21px] text-[#797776]">구독 정보를 불러오는 중...</p>
            ) : isError ? (
              <p className="text-[14px] leading-[21px] text-[#797776]">구독 정보를 불러오지 못했어요.</p>
            ) : subscription ? (
              <>
                <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
                  결제일 | {paidAt ?? "정보 없음"}
                </p>
                {isActive && canRequestRefund ? (
                  <button
                    type="button"
                    onClick={() => navigate("/mypage/refund")}
                    className="self-start text-[14px] leading-[21px] tracking-[-0.43px] text-[#F35C4B]"
                  >
                    환불 처리
                  </button>
                ) : isActive ? (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px] text-[#A5A4A3]">
                    환불 요청 완료
                  </p>
                ) : subscription.status === "COMPLETED" && subscription.remainingSeconds === 0 ? (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px] text-[#A5A4A3]">
                    이용 기간이 만료되었어요.
                  </p>
                ) : (
                  <p className="text-[14px] leading-[21px] tracking-[-0.43px] text-[#A5A4A3]">
                    {inactiveStatusMessages[subscription.status] ?? "현재 이용 중인 구독이 아니에요."}
                  </p>
                )}
              </>
            ) : (
              <p className="text-[14px] leading-[21px] text-[#797776]">이용 중인 구독이 없어요.</p>
            )}
          </article>

          <h2 className="ml-[6px] mt-[34px] text-[24px] font-semibold leading-[1.4] tracking-[-0.72px]">
            날씨 운세 이용권
          </h2>
          <article className={`${cardClassName} mt-[11px]`}>
            <h3 className="text-[16px] font-bold leading-[21px] tracking-[-0.43px]">
              날씨 운세
            </h3>
            <p className="text-[14px] leading-[21px] tracking-[-0.43px]">
              {usageCount == null ? "이용권 정보가 없어요." : `사용 횟수 | ${usageCount}회`}
            </p>
          </article>
        </section>
      </main>
    </MobileLayout>
  );
}
