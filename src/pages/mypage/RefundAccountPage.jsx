import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import { useRequestRefund } from "../../hooks/usePayment";
import refundConfirmationImage from "../../assets/images/refund-confirmation.png";

const fields = [
  { key: "bank", label: "계좌 은행", placeholder: "은행명을 입력해주세요" },
  { key: "account", label: "계좌번호", placeholder: "계좌번호를 입력해주세요", inputMode: "numeric" },
  { key: "phone", label: "전화번호", placeholder: "전화번호를 입력해주세요", inputMode: "tel" },
];

export default function RefundAccountPage() {
  const navigate = useNavigate();
  const refundMutation = useRequestRefund();
  const [form, setForm] = useState({ bank: "", account: "", phone: "" });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const canSubmit = Object.values(form).every((value) => value.trim());
  const handleChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      await refundMutation.mutateAsync(form);
      navigate("/mypage/payment", { replace: true });
    } catch {
      // Keep the confirmation open so the user can retry.
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
            환불 계좌 입력
          </h1>
          <p className="mt-[3px] text-[14px] leading-[1.4] tracking-[-0.42px] text-[#A5A4A3]">
            환불 절차는 입력해주신 정보에 따라 Wee STAFF 측에서
            <br />
            개별적으로 진행할 예정입니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="absolute left-[22px] right-[22px] top-[231px]">
          <div className="flex flex-col gap-[21px]">
            {fields.map(({ key, label, placeholder, inputMode }) => (
              <label key={key} className="block">
                <span className="mb-[21px] block text-[18px] font-semibold leading-[18px]">
                  {label}
                </span>
                <input
                  required
                  type="text"
                  inputMode={inputMode}
                  autoComplete="off"
                  value={form[key]}
                  onChange={handleChange(key)}
                  placeholder={placeholder}
                  className="h-[60px] w-full rounded-[15px] border-2 border-[#E9E8E8] bg-white px-6 text-[16px] font-semibold tracking-[-0.16px] text-[#1f1c1a] outline-none placeholder:font-medium placeholder:text-[#A5A4A3] focus:border-main"
                />
              </label>
            ))}
          </div>

          {refundMutation.isError && (
            <p role="alert" className="mt-3 text-center text-sm text-[#F35C4B]">
              환불 요청에 실패했어요. 입력 정보를 확인하고 다시 시도해주세요.
            </p>
          )}

          <Button
            type="submit"
            disabled={!canSubmit || refundMutation.isPending}
            className="absolute left-0 top-[481px] h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]"
          >
            {refundMutation.isPending ? "요청 중..." : "환불 요청"}
          </Button>
        </form>

        {isConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-8">
            <section
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="refund-confirm-title"
              aria-describedby="refund-confirm-description"
              className="w-full max-w-[327px] overflow-hidden rounded-[16px] bg-[#F4FAFF] pt-3 shadow-[0_5px_8px_rgba(0,0,0,0.15)]"
            >
              <div className="flex flex-col items-center px-4 pb-[15px] pt-[5px] text-center">
                <img
                  src={refundConfirmationImage}
                  alt=""
                  className="mb-[5px] h-[60px] w-[67px] object-contain"
                />
                <h2 id="refund-confirm-title" className="text-[17px] font-semibold leading-[22px] tracking-[-0.4px]">
                  환불 요청을 완료하시겠습니까?
                </h2>
                <p id="refund-confirm-description" className="mt-[5px] text-[13px] leading-[18px] tracking-[-0.4px] text-[#8F8E8D]">
                  입력한 정보는 환불 절차가 완료된 이후 폐기되며,
                  <br />
                  요청 이후 환불 절차가 진행됩니다.
                </p>
              </div>
              {refundMutation.isError && (
                <p role="alert" className="px-4 pb-2 text-center text-xs text-[#F35C4B]">
                  환불 요청에 실패했어요. 다시 시도해주세요.
                </p>
              )}
              <div className="flex h-[44px] border-t border-[#A5A4A3]/40">
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={refundMutation.isPending}
                  className="flex-1 text-[17px] font-semibold tracking-[-0.43px] text-main disabled:opacity-50"
                >
                  취소
                </button>
                <span aria-hidden="true" className="w-px bg-[#A5A4A3]/40" />
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={refundMutation.isPending}
                  className="flex-1 text-[17px] font-medium tracking-[-0.43px] text-[#8F8E8D] disabled:opacity-50"
                >
                  {refundMutation.isPending ? "처리 중..." : "확인"}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </MobileLayout>
  );
}
