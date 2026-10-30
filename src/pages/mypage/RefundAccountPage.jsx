import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Button from "../../components/Button";
import ConfirmDialog from "../../components/ConfirmDialog";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import {
  usePremiumBillingQuery,
  useRefundRequestQuery,
  useRequestRefund,
} from "../../hooks/usePayment";
import queryKeys from "../../api/queryKeys";
import useToast from "../../hooks/useToast";

const statusLabels = {
  REQUESTED: "환불 요청 접수",
  PROCESSING: "환불 처리 중",
  COMPLETED: "환불 완료",
  REJECTED: "환불 거절",
};

const getRefundStatusDescription = (refundRequest) => {
  if (refundRequest.status === "REJECTED")
    return "환불 요청이 거절되었어요. 자세한 내용은 아래 사유를 확인해주세요.";
  if (refundRequest.status === "COMPLETED")
    return "환불이 완료되어 남은 프리미엄 이용 기간이 회수되었어요.";
  if (refundRequest.paymentMethod === "BANK_TRANSFER")
    return "환불 처리 중에도 프리미엄 기능을 이용할 수 있어요. 관리자가 직접 송금한 뒤 완료 처리합니다.";
  return "환불 처리 중에도 프리미엄 기능을 이용할 수 있어요. PayApp 처리 결과에 따라 완료됩니다.";
};

export default function RefundAccountPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const refundMutation = useRequestRefund();
  const refundQuery = useRefundRequestQuery();
  const billingQuery = usePremiumBillingQuery();
  const refundRequest = refundMutation.data ?? refundQuery.data;
  const paymentMethod =
    refundRequest?.paymentMethod ?? billingQuery.data?.subscription?.paymentMethod;
  const confirmDescription = paymentMethod === "BANK_TRANSFER"
    ? "계좌이체 환불은 관리자가 직접 송금한 뒤 완료 처리합니다.\n환불 요청 후에도 프리미엄 기능은 계속 이용할 수 있어요."
    : "PayApp 처리 결과에 따라 환불이 진행됩니다.\n환불 요청 후에도 프리미엄 기능은 계속 이용할 수 있어요.";
  const [reason, setReason] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!reason.trim()) return;
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      await refundMutation.mutateAsync({ reason: reason.trim() });
      setIsConfirmOpen(false);
    } catch (error) {
      if (error.response?.data?.refundRequest) {
        queryClient.setQueryData(queryKeys.refundRequest, error.response.data.refundRequest);
      }
      toast.error(
        error.response?.data?.detail ??
          error.response?.data?.reason?.[0] ??
          "환불 요청에 실패했어요. 다시 시도해주세요.",
      );
    }
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] overflow-hidden bg-white text-[#1f1c1a]">
        <div className="absolute left-5 right-5 top-[73px] z-10">
          <Header back />
        </div>

        <div className="px-[27px] pt-[114px]">
          <h1 className="text-[24px] font-semibold leading-[1.4] tracking-[-0.72px]">
            {refundRequest ? "환불 진행 상태" : "환불 신청"}
          </h1>
          <p className="mt-[3px] text-[14px] leading-[1.4] tracking-[-0.42px] text-[#A5A4A3]">
            {refundRequest
              ? getRefundStatusDescription(refundRequest)
              : "환불 예정 금액은 남은 이용기간을 기준으로 계산돼요. 환불 요청만으로 프리미엄 이용이 중지되지는 않아요."}
          </p>
        </div>

        {refundQuery.isLoading && !refundMutation.data ? (
          <p className="px-[27px] pt-[72px] text-sm text-[#797776]">환불 요청 내역을 확인하고 있어요.</p>
        ) : refundRequest ? (
          <section className="mx-[22px] mt-[64px] rounded-[16px] border border-[#E9E8E8] p-5">
            <h2 className="text-lg font-semibold">{statusLabels[refundRequest.status] ?? "환불 요청"}</h2>
            <p className="mt-3 text-sm text-[#62605F]">
              환불 예정 금액 {Number(refundRequest.requestedAmount).toLocaleString("ko-KR")}원
            </p>
            <p className="mt-2 break-words text-sm leading-6 text-[#797776]">
              사유: {refundRequest.reason}
            </p>
            {refundRequest.rejectionReason && (
              <p className="mt-3 text-sm text-[#F35C4B]">{refundRequest.rejectionReason}</p>
            )}
            {refundRequest.status !== "REJECTED" && refundRequest.status !== "COMPLETED" && (
              <p className="mt-3 text-xs leading-5 text-[#A5A4A3]">
                {refundRequest.paymentMethod === "BANK_TRANSFER"
                  ? "계좌이체 환불은 관리자가 직접 송금한 뒤 완료 처리합니다."
                  : "PayApp 환불은 PayApp 승인 결과에 따라 처리됩니다."}
              </p>
            )}
            <Button onClick={() => navigate("/mypage/payment")} className="mt-5 h-11 w-full rounded-[10px]">
              결제 관리로
            </Button>
          </section>
        ) : (
        <form
          onSubmit={handleSubmit}
          className="absolute left-[22px] right-[32px] top-[231px]"
        >
          <label htmlFor="refund-reason" className="block">
            <span className="block text-[18px] font-semibold leading-[18px]">
              환불 사유
            </span>
            <textarea
              id="refund-reason"
              required
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="환불 사유를 간단히 입력해주세요."
              className="mt-[21px] h-[60px] w-[345px] resize-none rounded-[15px] border-2 border-[#E9E8E8] bg-white px-6 py-[17px] text-[16px] font-semibold leading-6 tracking-[-0.16px] text-[#1f1c1a] outline-none placeholder:font-medium placeholder:text-[#BCBBBA] focus:border-main"
            />
            <span className="mt-1 block w-[345px] text-right text-xs text-[#A5A4A3]">{reason.length}/500</span>
          </label>

          <Button
            type="submit"
            disabled={!reason.trim() || refundMutation.isPending}
            className="absolute left-[1px] top-[481px] h-[44px] w-[345px] rounded-[10px] text-[18px] tracking-[-0.18px]"
          >
            환불 요청
          </Button>
        </form>
        )}

        <ConfirmDialog
          isOpen={isConfirmOpen}
          variant="refund"
          description={confirmDescription}
          loading={refundMutation.isPending}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirm}
        />
      </main>
    </MobileLayout>
  );
}
