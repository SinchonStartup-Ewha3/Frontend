import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import ConfirmDialog from "../../components/ConfirmDialog";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import { useRequestRefund } from "../../hooks/usePayment";
import useToast from "../../hooks/useToast";

export default function RefundAccountPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const refundMutation = useRequestRefund();
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
      navigate("/mypage/payment", { replace: true });
    } catch {
      toast.error("환불 요청에 실패했어요. 다시 시도해주세요.");
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
            환불 신청
          </h1>
          <p className="mt-[3px] text-[14px] leading-[1.4] tracking-[-0.42px] text-[#A5A4A3]">
            환불 절차는 이전에 결제하신 Paddle을 통해 진행할 예정입니다.
          </p>
        </div>

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
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="환불 사유를 간단히 입력해주세요."
              className="mt-[21px] h-[60px] w-[345px] resize-none rounded-[15px] border-2 border-[#E9E8E8] bg-white px-6 py-[17px] text-[16px] font-semibold leading-6 tracking-[-0.16px] text-[#1f1c1a] outline-none placeholder:font-medium placeholder:text-[#BCBBBA] focus:border-main"
            />
          </label>

          <Button
            type="submit"
            disabled={!reason.trim() || refundMutation.isPending}
            className="absolute left-[1px] top-[481px] h-[44px] w-[345px] rounded-[10px] text-[18px] tracking-[-0.18px]"
          >
            환불 요청
          </Button>
        </form>

        <ConfirmDialog
          isOpen={isConfirmOpen}
          variant="refund"
          loading={refundMutation.isPending}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirm}
        />
      </main>
    </MobileLayout>
  );
}
