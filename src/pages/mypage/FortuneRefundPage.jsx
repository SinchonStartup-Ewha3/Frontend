import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Button from "../../components/Button";
import ConfirmDialog from "../../components/ConfirmDialog";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import queryKeys from "../../api/queryKeys";
import useToast from "../../hooks/useToast";
import {
  useFortunePurchasesQuery,
  useFortuneRefundQuery,
  useRequestFortuneRefund,
} from "../../hooks/useFortunePayment";
import {
  FORTUNE_REFUND_STATUS_LABELS,
  canRequestFortuneRefund,
  formatDotDate,
  formatKoreanDate,
  formatWon,
} from "../../constants/fortune";

const cardClass = "rounded-[16px] border border-[#E9E8E8] p-5";

const getStatusDescription = (refundRequest) => {
  if (refundRequest.status === "REJECTED")
    return "환불 요청이 거절되었어요. 자세한 내용은 아래 사유를 확인해주세요.";
  if (refundRequest.status === "COMPLETED")
    return "PayApp 승인취소 및 환불이 완료되었어요.";
  return "운영진이 확인한 뒤 PayApp에서 환불을 처리해요.";
};

// 운세 이용권(PayApp) 환불 신청 / 진행 상태 화면
export default function FortuneRefundPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const purchasesQuery = useFortunePurchasesQuery();
  const refundQuery = useFortuneRefundQuery();
  const refundMutation = useRequestFortuneRefund();
  const [reason, setReason] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const purchases = purchasesQuery.data;
  const pass = purchases?.current ?? purchases?.latest;
  const latestRefund = refundMutation.data ?? refundQuery.data;
  // 최근 환불 요청이 지금 보고 있는 이용권의 것일 때만 "진행 상태"로 보여줘요
  // (예전에 환불 완료된 건이 새 이용권 화면에 남는 것 방지)
  const refundRequest =
    latestRefund && (!pass || latestRefund.purchaseId === pass.purchase_id)
      ? latestRefund
      : null;
  const canRefund = canRequestFortuneRefund(pass);
  const isLoading =
    (purchasesQuery.isPending || refundQuery.isPending) && !refundMutation.data;
  const isLoadError =
    (purchasesQuery.isError || refundQuery.isError) && !refundMutation.data;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!reason.trim() || !canRefund) return;
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      await refundMutation.mutateAsync({
        purchaseId: pass.purchase_id,
        reason: reason.trim(),
      });
      setIsConfirmOpen(false);
    } catch (error) {
      setIsConfirmOpen(false);
      const data = error.response?.data;
      if (data?.code === "FORTUNE_REFUND_ALREADY_EXISTS") {
        // 이미 접수된 요청이면 진행 상태 화면으로 바꿔줘요
        queryClient.invalidateQueries({ queryKey: queryKeys.fortuneRefund });
        queryClient.invalidateQueries({ queryKey: queryKeys.fortunePurchases });
      }
      toast.error(
        data?.reason?.[0] ??
          data?.detail ??
          "환불 요청에 실패했어요. 다시 시도해주세요.",
      );
    }
  };

  const cannotRefundMessage = !pass
    ? "환불 가능한 운세 이용권이 없어요."
    : pass.payment_method !== "PAYAPP"
      ? "PayApp으로 결제한 이용권만 환불할 수 있어요. 쿠폰 이용권은 환불할 수 없어요."
      : "이미 만료되었거나 마지막 사용일이라 남은 기간이 없는 이용권은 환불할 수 없어요.";

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] overflow-hidden bg-white pb-12 text-[#1f1c1a]">
        <div className="absolute left-5 right-5 top-[73px] z-10">
          <Header back />
        </div>

        <div className="px-[27px] pt-[114px]">
          <h1 className="text-[24px] font-semibold leading-[1.4] tracking-[-0.72px]">
            {refundRequest ? "환불 진행 상태" : "운세 이용권 환불"}
          </h1>
          <p className="mt-[3px] text-[14px] leading-[1.4] tracking-[-0.42px] text-[#A5A4A3]">
            {refundRequest
              ? getStatusDescription(refundRequest)
              : "PayApp으로 결제한 이용권만 환불할 수 있어요. 환불은 운영진이 확인 후 처리해요."}
          </p>
        </div>

        {isLoading ? (
          <p
            role="status"
            className="px-[27px] pt-[72px] text-sm text-[#797776]"
          >
            환불 가능 여부를 확인하고 있어요.
          </p>
        ) : isLoadError ? (
          <div className="flex flex-col items-start gap-3 px-[27px] pt-[72px]">
            <p role="alert" className="text-sm text-[#797776]">
              정보를 불러오지 못했어요.
            </p>
            <button
              type="button"
              onClick={() => {
                purchasesQuery.refetch();
                refundQuery.refetch();
              }}
              className="text-sm text-[#5ADCF4] underline"
            >
              다시 시도
            </button>
          </div>
        ) : refundRequest ? (
          <section
            aria-label="환불 진행 상태"
            className={`mx-[22px] mt-[40px] ${cardClass}`}
          >
            <h2 className="text-lg font-semibold">
              {refundRequest.status === "REQUESTED" && refundMutation.data
                ? "환불 요청이 접수되었습니다."
                : (FORTUNE_REFUND_STATUS_LABELS[refundRequest.status] ??
                  "환불 요청")}
            </h2>
            <dl className="mt-4 flex flex-col gap-2 text-sm leading-6 text-[#62605F]">
              <div className="flex justify-between gap-3">
                <dt>상태</dt>
                <dd className="font-medium text-[#1f1c1a]">
                  {FORTUNE_REFUND_STATUS_LABELS[refundRequest.status] ??
                    refundRequest.status}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>예상 환불 금액</dt>
                <dd className="font-medium text-[#1f1c1a]">
                  {formatWon(refundRequest.requestedAmount)}원
                </dd>
              </div>
              {refundRequest.unusedDays != null && (
                <div className="flex justify-between gap-3">
                  <dt>환불 기준 남은 일수</dt>
                  <dd>{refundRequest.unusedDays}일</dd>
                </div>
              )}
              {refundRequest.requestedOn && (
                <div className="flex justify-between gap-3">
                  <dt>이용 가능일</dt>
                  <dd>{formatKoreanDate(refundRequest.requestedOn)}까지</dd>
                </div>
              )}
              {refundRequest.stopFrom && (
                <div className="flex justify-between gap-3">
                  <dt>이용 중지일</dt>
                  <dd>{formatKoreanDate(refundRequest.stopFrom)}부터</dd>
                </div>
              )}
            </dl>
            <p className="mt-3 break-words text-sm leading-6 text-[#797776]">
              사유: {refundRequest.reason}
            </p>

            {refundRequest.status === "REJECTED" && (
              <p className="mt-3 text-sm leading-6 text-[#F35C4B]">
                {refundRequest.rejectionReason ||
                  "환불 조건에 맞지 않아 거절되었어요."}
                <br />
                <span className="text-[#797776]">
                  심사 중 중지된 날짜만큼 이용 기간이 복원돼요.
                </span>
              </p>
            )}
            {(refundRequest.status === "REQUESTED" ||
              refundRequest.status === "PROCESSING") &&
              refundRequest.stopFrom && (
                <p className="mt-3 text-xs leading-5 text-[#A5A4A3]">
                  {formatKoreanDate(refundRequest.stopFrom)}부터 운세 이용이
                  중지돼요. 환불이 거절되면 중지된 날짜만큼 이용 기간이
                  복원돼요.
                </p>
              )}
            {refundRequest.status === "COMPLETED" &&
              refundRequest.completedAt && (
                <p className="mt-3 text-xs leading-5 text-[#A5A4A3]">
                  환불 완료일 {formatDotDate(refundRequest.completedAt)}
                </p>
              )}

            <Button
              onClick={() => navigate("/mypage/payment")}
              className="mt-5 h-11 w-full rounded-[10px]"
            >
              결제 관리로
            </Button>
          </section>
        ) : !canRefund ? (
          <section
            aria-label="환불 불가 안내"
            className={`mx-[22px] mt-[40px] ${cardClass}`}
          >
            <p role="status" className="text-sm leading-6 text-[#62605F]">
              {cannotRefundMessage}
            </p>
            <Button
              onClick={() => navigate("/mypage/payment")}
              className="mt-5 h-11 w-full rounded-[10px]"
            >
              결제 관리로
            </Button>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-[22px] mt-[32px] flex flex-col gap-5"
          >
            <section
              aria-label="환불 대상 이용권"
              className={`${cardClass} flex flex-col gap-1 text-sm leading-6 text-[#62605F]`}
            >
              <h2 className="text-[16px] font-semibold text-[#1f1c1a]">
                {pass.product_title}
              </h2>
              {pass.active_from && pass.active_until && (
                <p>
                  이용 일자 | {formatDotDate(pass.active_from)} ~{" "}
                  {formatDotDate(pass.active_until)}
                </p>
              )}
              {pass.remaining_days != null && (
                <p>남은 기간 | {pass.remaining_days}일</p>
              )}
              <p className="mt-2 text-xs leading-5 text-[#A5A4A3]">
                환불 금액은 결제 금액 × 다음 날부터 남은 일수 ÷ 전체 이용 일수로
                계산하고, 원 단위 미만은 내림해요. 환불 요청 당일까지는 이용할
                수 있고 다음 날부터 이용이 중지돼요.
              </p>
            </section>

            <label htmlFor="fortune-refund-reason" className="block">
              <span className="block text-[18px] font-semibold leading-[18px]">
                환불 사유
              </span>
              <textarea
                id="fortune-refund-reason"
                required
                maxLength={500}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="환불 사유를 간단히 입력해주세요."
                className="mt-[14px] h-[96px] w-full resize-none rounded-[15px] border-2 border-[#E9E8E8] bg-white px-6 py-[17px] text-[16px] font-semibold leading-6 tracking-[-0.16px] text-[#1f1c1a] outline-none placeholder:font-medium placeholder:text-[#BCBBBA] focus:border-main"
              />
              <span className="mt-1 block text-right text-xs text-[#A5A4A3]">
                {reason.length}/500
              </span>
            </label>

            <Button
              type="submit"
              disabled={!reason.trim() || refundMutation.isPending}
              className="h-[44px] w-full rounded-[10px] text-[18px] tracking-[-0.18px]"
            >
              {refundMutation.isPending ? "요청 중..." : "환불 요청"}
            </Button>
          </form>
        )}

        <ConfirmDialog
          isOpen={isConfirmOpen}
          variant="refund"
          description={
            "환불 금액은 남은 이용 기간을 기준으로 계산돼요.\n요청 당일까지 이용할 수 있고, 다음 날부터 이용이 중지돼요."
          }
          loading={refundMutation.isPending}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirm}
        />
      </main>
    </MobileLayout>
  );
}
