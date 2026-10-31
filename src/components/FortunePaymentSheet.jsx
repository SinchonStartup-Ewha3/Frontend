import { useEffect, useRef, useState } from "react";
import BottomSheet from "./BottomSheet";
import packageMascot from "../assets/images/fortune/fortune_package_sprites.png";
import {
  FORTUNE_FALLBACK_DAILY_PRICE,
  FORTUNE_PAYMENT_FAIL_MESSAGES,
  formatDotDate,
  formatWon,
  getFortunePackageLabel,
} from "../constants/fortune";
import {
  useCreateFortuneCheckout,
  useFortuneProductsQuery,
  useFortunePurchaseStatus,
  useRefreshFortuneData,
} from "../hooks/useFortunePayment";
import {
  clearPendingFortunePurchase,
  loadPendingFortunePurchase,
  savePendingFortunePurchase,
} from "../utils/fortunePayment";

// 패키지 기간별 캐릭터 아이콘 (7일 이하 1마리 / 14일 이하 2마리 / 그 이상 3마리)
const getPackageIcon = (days) =>
  days <= 7 ? packageIcon1 : days <= 14 ? packageIcon2 : packageIcon3;

// 날씨 운세 "유료 결제" 바텀시트
// 열릴 때마다 새로 마운트돼서 상태가 자동 초기화돼요.
export default function FortunePaymentSheet({ isOpen, ...props }) {
  if (!isOpen) return null;
  return <FortunePaymentSheetBody isOpen={isOpen} {...props} />;
}

// 단계: select(상품 선택) -> phone(휴대전화 입력) -> waiting(결제 확인 중) -> done / failed
function FortunePaymentSheetBody({ isOpen, onClose, onOpenCoupon, onPaid }) {
  // 결제창을 띄워 둔 주문이 남아 있으면 확인 단계로 바로 이어가요
  const [pending, setPending] = useState(() => loadPendingFortunePurchase()); // { purchaseId, paymentUrl, productTitle }
  const [baseStep, setBaseStep] = useState(() =>
    pending ? "waiting" : "select",
  );
  const [selected, setSelected] = useState(null);
  const [recvphone, setRecvphone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const paidHandled = useRef(false);

  const productsQuery = useFortuneProductsQuery({ enabled: isOpen });
  const createCheckout = useCreateFortuneCheckout();
  const refreshFortuneData = useRefreshFortuneData();
  const { purchase, paymentStatus, isTimedOut, restart } =
    useFortunePurchaseStatus(pending?.purchaseId, {
      enabled: isOpen && baseStep === "waiting",
    });

  // 결제 결과에 따라 화면 단계를 계산 (상태를 따로 두지 않고 파생)
  const failMessage = FORTUNE_PAYMENT_FAIL_MESSAGES[paymentStatus];
  let step = baseStep;
  if (baseStep === "waiting") {
    if (paymentStatus === "PAID") step = "done";
    else if (failMessage) step = "failed";
  }

  // 결제 결과 부수 효과 (이용권 반영 / 저장해 둔 주문 정리)
  useEffect(() => {
    if (baseStep !== "waiting") return;
    if (paymentStatus === "PAID" && !paidHandled.current) {
      paidHandled.current = true;
      clearPendingFortunePurchase();
      refreshFortuneData();
      onPaid?.(purchase);
    } else if (paymentStatus in FORTUNE_PAYMENT_FAIL_MESSAGES) {
      clearPendingFortunePurchase();
    }
  }, [baseStep, paymentStatus, purchase, onPaid, refreshFortuneData]);

  const products = productsQuery.data ?? [];
  const daily = products.find((product) => product.duration_days === 1);
  const dailyPrice = daily?.price ?? FORTUNE_FALLBACK_DAILY_PRICE;
  const packages = products
    .filter((product) => product.duration_days > 1)
    .sort((a, b) => a.duration_days - b.duration_days);

  const handleSelect = (product) => {
    setSelected(product);
    setErrorMessage("");
    setBaseStep("phone");
  };

  const handleCheckout = async () => {
    if (!selected || createCheckout.isPending) return;
    setErrorMessage("");
    // 팝업 차단을 피하려고 클릭 직후에 먼저 빈 창을 열어 둬요
    const checkoutWindow = window.open("about:blank", "_blank");
    try {
      const checkout = await createCheckout.mutateAsync({
        productId: selected.id,
        recvphone,
      });
      if (!checkout?.paymentUrl || !checkout?.purchaseId) {
        throw new Error("결제창 주소를 받지 못했어요. 다시 시도해 주세요.");
      }
      const nextPending = {
        purchaseId: checkout.purchaseId,
        paymentUrl: checkout.paymentUrl,
        productTitle: checkout.purchase?.product_title ?? selected.title,
      };
      savePendingFortunePurchase(nextPending);
      setPending(nextPending);
      paidHandled.current = false;
      setBaseStep("waiting");
      if (checkoutWindow) checkoutWindow.location.href = checkout.paymentUrl;
      else window.location.assign(checkout.paymentUrl);
    } catch (error) {
      checkoutWindow?.close();
      const data = error.response?.data;
      setErrorMessage(
        data?.recvphone?.[0] ??
          data?.product_id?.[0] ??
          data?.non_field_errors?.[0] ??
          data?.detail ??
          (error.response?.status === 401
            ? "로그인 정보가 만료됐어요. 다시 로그인해 주세요."
            : error.message || "결제 요청에 실패했어요. 다시 시도해 주세요."),
      );
    }
  };

  const reopenPaymentWindow = () => {
    if (!pending?.paymentUrl) return;
    const opened = window.open(pending.paymentUrl, "_blank");
    if (!opened) window.location.assign(pending.paymentUrl);
  };

  const backToSelect = () => {
    clearPendingFortunePurchase();
    setPending(null);
    setSelected(null);
    setErrorMessage("");
    setBaseStep("select");
  };

  const panelText =
    "text-[12px] leading-[1.5] tracking-[-0.36px] text-[#E9E8E8]";
  const linkButton =
    "text-[14px] font-medium leading-[1.5] tracking-[-0.42px] text-white underline underline-offset-2";

  return (
    <BottomSheet
      isOpen={isOpen}
      title="유료 결제"
      onClose={onClose}
      showHandle={false}
      showHeader={false}
      hideScrollbar
      backdropClassName="bg-[#D9D9D9]/75"
      className="!max-h-[90dvh] !rounded-t-[30px] !bg-[#434343]/40 !px-0 !pb-0 !pt-6 !shadow-none"
    >
      <div className="mx-auto mb-[14px] flex h-[38px] w-[calc(100%-72px)] items-center justify-between">
        <h2 className="text-[26px] font-semibold leading-[1.4] tracking-[-0.78px] text-white">
          유료 결제
        </h2>
        <button
          type="button"
          aria-label="유료 결제 창 닫기"
          onClick={onClose}
          className="flex h-[23px] w-[23px] items-center justify-center rounded-full bg-white/70 text-[12px] leading-none text-[#797776]"
        >
          ×
        </button>
      </div>

      <div className="mx-auto mb-2 h-[322px] w-[calc(100%-72px)] overflow-y-auto rounded-[20px] bg-[#575757]/60 px-[20px] pb-3 pt-[10px]">
        {step === "select" && (
          <>
            <p className="text-[10px] font-semibold leading-[1.5] tracking-[-0.3px] text-[#E9E8E8]">
              테루테루 카드 속 코드를 등록해 날씨 운세를 볼 수 있어요.
              <br />
              원하는 패키지 상품을 클릭하여 Wee의 날씨 운세 서비스를
              이용해보세요.
            </p>

            {productsQuery.isPending ? (
              <p
                role="status"
                className="py-10 text-center text-[13px] text-white"
              >
                상품을 불러오는 중...
              </p>
            ) : productsQuery.isError ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p role="alert" className="text-[13px] text-white">
                  상품 정보를 불러오지 못했어요.
                </p>
                <button
                  type="button"
                  onClick={() => productsQuery.refetch()}
                  className={linkButton}
                >
                  다시 시도
                </button>
              </div>
            ) : (
              <ul className="mt-[9px]">
                {packages.map((product) => {
                  const base = dailyPrice * product.duration_days;
                  const save =
                    base > 0 ? Math.round((1 - product.price / base) * 100) : 0;
                  const mascotCount = Math.min(
                    3,
                    Math.max(1, Math.ceil(product.duration_days / 7)),
                  );
                  const mascotSize =
                    mascotCount === 1
                      ? "h-[52px] w-[43px]"
                      : mascotCount === 2
                        ? "h-[40px] w-[33px]"
                        : "h-[36px] w-[30px]";
                  return (
                    <li
                      key={product.id}
                      className="h-[74px] border-t border-white/90"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(product)}
                        aria-label={`${product.title} ${formatWon(product.price)}원 결제`}
                        className="block w-full px-2 pb-[14px] pt-[6px] text-left"
                      >
                        <span className="block text-right text-[10px] leading-[1.5] text-white">
                          {getFortunePackageLabel(product.duration_days)}
                        </span>
                        <span className="mt-[6px] flex items-baseline gap-4 pl-[42px]">
                          <span className="text-[20px] font-medium leading-[1.2] tracking-[-0.6px] text-white">
                            {formatWon(product.price)}₩
                          </span>
                          {save > 0 && (
                            <span className="text-[12px] font-medium text-[#60E1FF]">
                              {save}% Save
                            </span>
                          )}
                        </span>
                        <span className="mt-[6px] block pl-[42px] text-[11px] leading-[1.4] text-white">
                          {formatWon(dailyPrice)}₩ x {product.duration_days}days
                          ⇒ {formatWon(base)}₩
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {!productsQuery.isPending && !productsQuery.isError && (
              <div className="mt-0 flex flex-col items-center gap-[5px]">
                {daily && (
                  <button
                    type="button"
                    onClick={() => handleSelect(daily)}
                    className="text-[8px] font-medium leading-[1.5] text-[#D2D2D1] underline underline-offset-2"
                  >
                    {formatWon(daily.price)}원 하루만 결제하기
                  </button>
                )}
                <p className="text-center text-[8px] leading-[1.5] text-[#E9E8E8]">
                  날짜가 지나면 그 날 사용하지 않은 코인은 자동 소멸됩니다.
                </p>
                {onOpenCoupon && (
                  <button
                    type="button"
                    onClick={onOpenCoupon}
                    className="text-[8px] leading-[1.5] text-[#E9E8E8] underline underline-offset-2"
                  >
                    쿠폰 코드가 있어요
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {step === "phone" && selected && (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[12px] text-[#E9E8E8]">선택한 상품</p>
              <p className="mt-1 text-[18px] font-semibold tracking-[-0.54px] text-white">
                {selected.title} · {formatWon(selected.price)}원
              </p>
              <p className="mt-[2px] text-[11px] text-[#E9E8E8]">
                {selected.duration_days}일 동안 하루 1코인으로 상세 풀이를
                확인해요.
              </p>
            </div>
            <label htmlFor="fortune-payapp-phone" className="block">
              <span className={panelText}>
                결제창에서 결제를 진행할 휴대전화 번호를 입력해 주세요.
              </span>
              <input
                id="fortune-payapp-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={11}
                value={recvphone}
                onChange={(event) => {
                  setRecvphone(
                    event.target.value.replace(/\D/g, "").slice(0, 11),
                  );
                  setErrorMessage("");
                }}
                placeholder="01012345678"
                className="mt-2 h-[49px] w-full rounded-[15px] border-2 border-[#E9E8E8] bg-white px-[23px] text-[14px] font-semibold tracking-[-0.14px] text-[#353331] outline-none placeholder:text-[#BCBBBA] focus:border-[#60E1FF]"
              />
            </label>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={createCheckout.isPending || recvphone.length < 10}
              className="mx-auto h-[40px] w-[193px] rounded-[10px] bg-[#60E1FF] text-[16px] font-semibold tracking-[-0.16px] text-white disabled:opacity-50"
            >
              {createCheckout.isPending
                ? "결제창을 준비하고 있어요"
                : "PayApp 결제하기"}
            </button>
            {errorMessage && (
              <p
                role="alert"
                className="text-center text-[12px] leading-[1.5] text-white"
              >
                {errorMessage}
              </p>
            )}
            <button
              type="button"
              onClick={backToSelect}
              className="mx-auto text-[12px] text-[#E9E8E8] underline underline-offset-2"
            >
              다른 상품 선택하기
            </button>
          </div>
        )}

        {step === "waiting" && (
          <div className="flex flex-col items-center gap-3 py-5 text-center">
            <p className="text-[18px] font-semibold tracking-[-0.54px] text-white">
              결제 확인 중이에요
            </p>
            <p
              role="status"
              aria-live="polite"
              className="whitespace-pre-line text-[12px] leading-[1.6] text-[#E9E8E8]"
            >
              {pending?.productTitle ? `${pending.productTitle}\n` : ""}
              결제창에서 결제를 마치면 자동으로 이용권이 적용돼요.
              {isTimedOut ? "\n아직 결제 승인 정보를 확인하지 못했어요." : ""}
            </p>
            <div className="mt-1 flex flex-col items-center gap-[10px]">
              <button
                type="button"
                onClick={reopenPaymentWindow}
                className={linkButton}
              >
                결제창 다시 열기
              </button>
              {isTimedOut && (
                <button type="button" onClick={restart} className={linkButton}>
                  결제 상태 다시 확인
                </button>
              )}
              <button
                type="button"
                onClick={backToSelect}
                className="text-[12px] text-[#E9E8E8] underline underline-offset-2"
              >
                결제하지 않고 다시 선택하기
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-3 py-5 text-center">
            <p className="text-[18px] font-semibold tracking-[-0.54px] text-white">
              결제가 완료되었어요!
            </p>
            <p
              role="status"
              className="whitespace-pre-line text-[12px] leading-[1.6] text-[#E9E8E8]"
            >
              {purchase?.product_title ??
                pending?.productTitle ??
                "운세 이용권"}
              {purchase?.active_from && purchase?.active_until
                ? `\n이용 기간: ${formatDotDate(purchase.active_from)} ~ ${formatDotDate(purchase.active_until)}`
                : ""}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-1 h-[40px] w-[193px] rounded-[10px] bg-[#60E1FF] text-[16px] font-semibold tracking-[-0.16px] text-white"
            >
              확인
            </button>
          </div>
        )}

        {step === "failed" && (
          <div className="flex flex-col items-center gap-3 py-5 text-center">
            <p role="alert" className="text-[14px] leading-[1.6] text-white">
              {failMessage || errorMessage || "결제를 완료하지 못했어요."}
            </p>
            <button type="button" onClick={backToSelect} className={linkButton}>
              다시 선택하기
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
