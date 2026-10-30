import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/Button";
import MobileLayout from "../../components/MobileLayout";
import angelFortune from "../../assets/images/fortune/fortune_angel.svg";
import loadingDots from "../../assets/icons/loading-dots.svg";
import {
  FORTUNE_PAYMENT_FAIL_MESSAGES,
  formatDotDate,
  formatWon,
} from "../../constants/fortune";
import {
  useFortunePurchaseStatus,
  useRefreshFortuneData,
} from "../../hooks/useFortunePayment";
import {
  clearPendingFortunePurchase,
  loadPendingFortunePurchase,
} from "../../utils/fortunePayment";

// PayApp 결제창에서 돌아왔을 때 보는 "결제 결과" 화면
// 주문 번호는 ?purchaseId= (또는 purchase_id) 쿼리 -> 없으면 결제 직전에 저장해 둔 주문을 사용해요
export default function WeatherFortunePaymentResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refreshFortuneData = useRefreshFortuneData();
  const handled = useRef(false);
  const queryId =
    searchParams.get("purchaseId") ?? searchParams.get("purchase_id");
  const purchaseId = queryId
    ? Number(queryId)
    : loadPendingFortunePurchase()?.purchaseId;
  const { purchase, paymentStatus, isError, error, isTimedOut, restart } =
    useFortunePurchaseStatus(purchaseId);

  useEffect(() => {
    if (paymentStatus !== "PAID" || handled.current) return undefined;
    handled.current = true;
    clearPendingFortunePurchase();
    refreshFortuneData();
    const timer = window.setTimeout(
      () => navigate("/weather-fortune/result", { replace: true }),
      2500,
    );
    return () => window.clearTimeout(timer);
  }, [paymentStatus, navigate, refreshFortuneData]);

  useEffect(() => {
    if (paymentStatus && paymentStatus in FORTUNE_PAYMENT_FAIL_MESSAGES) {
      clearPendingFortunePurchase();
    }
  }, [paymentStatus]);

  const failMessage = FORTUNE_PAYMENT_FAIL_MESSAGES[paymentStatus];
  const notFound =
    !purchaseId || (isError && [403, 404].includes(error?.response?.status));
  const isPaid = paymentStatus === "PAID";
  const isPending = !isPaid && !failMessage && !notFound && !isTimedOut;

  let title = "결제를 확인하고 있어요";
  let description =
    "잠시만 기다려 주세요.\n결제가 확인되면 이용권이 바로 적용돼요.";
  if (isPaid) {
    title = "결제가 완료되었어요!";
    description = `${purchase?.product_title ?? "운세 이용권"}${
      purchase?.active_from && purchase?.active_until
        ? `\n이용 기간 ${formatDotDate(purchase.active_from)} ~ ${formatDotDate(purchase.active_until)}`
        : ""
    }\n잠시 후 오늘의 운세로 이동해요.`;
  } else if (failMessage) {
    title = "결제가 완료되지 않았어요";
    description = failMessage;
  } else if (notFound) {
    title = "결제 정보를 찾지 못했어요";
    description = "결제 내역은 마이페이지 > 결제 관리에서 확인할 수 있어요.";
  } else if (isTimedOut) {
    title = "아직 결제 승인이 확인되지 않았어요";
    description = "결제는 접수되었을 수 있어요.\n잠시 후 다시 확인해 주세요.";
  }

  return (
    <MobileLayout>
      <main
        className="relative mx-auto flex min-h-[852px] w-full max-w-[390px] flex-col items-center overflow-hidden px-6 pt-[160px] text-center text-[#353331]"
        style={{
          backgroundImage:
            "linear-gradient(158.32deg, #fff 3.3%, #f9f4fe 24.56%, #dcf4fc 67.5%, #fff 99.09%)",
        }}
      >
        <h1 className="text-[26px] font-semibold leading-[1.4] tracking-[-0.78px]">
          {title}
        </h1>
        <p
          role={failMessage || notFound ? "alert" : "status"}
          aria-live="polite"
          className="mt-3 whitespace-pre-line text-[16px] font-medium leading-[1.5] tracking-[-0.48px] text-[#A5A4A3]"
        >
          {description}
        </p>

        {isPaid ? (
          <>
            <img
              src={angelFortune}
              alt=""
              aria-hidden="true"
              className="mt-10 h-[150px] w-[150px] object-contain"
            />
            {purchase?.amount != null && (
              <p className="mt-4 text-[14px] text-[#797776]">
                결제 금액 {formatWon(purchase.amount)}원
              </p>
            )}
          </>
        ) : isPending ? (
          <img
            src={loadingDots}
            alt="결제 확인 중"
            className="mt-16 h-12 w-12 animate-pulse"
          />
        ) : null}

        <div className="mt-auto flex w-full flex-col gap-3 pb-12">
          {isPaid && (
            <Button
              onClick={() =>
                navigate("/weather-fortune/result", { replace: true })
              }
              className="!h-[44px] text-[18px]"
            >
              오늘의 운세 보기
            </Button>
          )}
          {isTimedOut && !isPaid && !failMessage && !notFound && (
            <Button onClick={restart} className="!h-[44px] text-[18px]">
              결제 상태 다시 확인
            </Button>
          )}
          {(failMessage || notFound) && (
            <Button
              onClick={() =>
                navigate("/weather-fortune/result", { replace: true })
              }
              className="!h-[44px] text-[18px]"
            >
              운세 화면으로
            </Button>
          )}
          {!isPaid && !isPending && (
            <Button
              variant="white"
              onClick={() => navigate("/mypage/payment")}
              className="!h-[44px] text-[16px]"
            >
              결제 관리 보기
            </Button>
          )}
        </div>
      </main>
    </MobileLayout>
  );
}
