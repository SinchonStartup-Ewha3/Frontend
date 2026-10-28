import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import {
  PREMIUM_BANK_TRANSFER_ACCOUNT,
  PREMIUM_PLAN,
} from "../../constants/premium";

export default function PremiumBankTransferPage() {
  const navigate = useNavigate();
  const [depositorName, setDepositorName] = useState("");

  const continueToSurvey = () => {
    if (!depositorName.trim()) return;
    navigate("/premium/survey", {
      state: {
        bankTransferManual: true,
        depositorName: depositorName.trim(),
      },
    });
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] bg-white px-6 pt-[73px] text-[#353331]">
        <Header back />
        <h1 className="mt-10 text-[26px] font-semibold leading-[1.4] tracking-[-0.78px]">
          계좌이체 안내
        </h1>

        <section className="mt-6 rounded-[16px] border border-[#E9E8E8] p-5" aria-label="입금 계좌 안내">
          <h2 className="text-[16px] font-semibold">입금 계좌</h2>
          <dl className="mt-3 space-y-2 text-[15px] leading-6 text-[#797776]">
            <div className="flex gap-3"><dt className="shrink-0">은행</dt><dd>{PREMIUM_BANK_TRANSFER_ACCOUNT.bankName}</dd></div>
            <div className="flex gap-3"><dt className="shrink-0">계좌번호</dt><dd>{PREMIUM_BANK_TRANSFER_ACCOUNT.accountNumber}</dd></div>
            <div className="flex gap-3"><dt className="shrink-0">예금주</dt><dd>{PREMIUM_BANK_TRANSFER_ACCOUNT.accountHolder}</dd></div>
            <div className="flex gap-3"><dt className="shrink-0">입금 금액</dt><dd>{PREMIUM_PLAN.priceLabel}</dd></div>
          </dl>
        </section>

        <label htmlFor="premium-depositor-name" className="mt-7 block text-[16px] font-semibold">
          입금자명
        </label>
        <input
          id="premium-depositor-name"
          value={depositorName}
          onChange={(event) => setDepositorName(event.target.value)}
          maxLength={30}
          placeholder="실제 입금자명을 입력해 주세요."
          className="mt-3 h-[56px] w-full rounded-[12px] border border-[#D2D2D1] px-4 text-[16px] outline-none focus:border-main"
        />

        <div className="mt-4 rounded-[12px] bg-[#F5FCFD] p-4 text-[13px] leading-5 text-[#797776]">
          <p>입금 내역을 운영자가 확인한 뒤 관리자 페이지에서 프리미엄을 활성화합니다.</p>
          <p className="mt-2 font-semibold text-[#E58B2A]">
            목업 계좌 정보입니다. 실제로 송금하지 마세요.
          </p>
          <p className="mt-1">입금자명은 이 기기에만 임시 저장되고 운영자에게 전송되지 않습니다.</p>
        </div>

        <div className="absolute bottom-[112px] left-6 right-6">
          <Button onClick={continueToSurvey} disabled={!depositorName.trim()} className="h-[44px] rounded-[10px] text-[18px]">
            입금 완료했어요
          </Button>
        </div>
      </main>
    </MobileLayout>
  );
}
