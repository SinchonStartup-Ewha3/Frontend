import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Header from "../../components/Header";
import {
  useCreateBankTransferRequest,
  useRedirectIfPremium,
} from "../../hooks/usePayment";
import MobileLayout from "../../components/MobileLayout";
import useToast from "../../hooks/useToast";
import copyAccountIcon from "../../assets/icons/copy-account.svg";
import {
  PREMIUM_BANK_TRANSFER_PENDING_KEY,
  PREMIUM_BANK_TRANSFER_ACCOUNT,
  PREMIUM_PLAN,
} from "../../constants/premium";

export default function PremiumBankTransferPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const createRequest = useCreateBankTransferRequest();
  const isLocalPreview =
    import.meta.env.DEV &&
    new URLSearchParams(location.search).get("preview") === "1";
  const [depositorName, setDepositorName] = useState("");
  const hasAccessToken = Boolean(localStorage.getItem("wee_access_token"));
  useRedirectIfPremium({ enabled: hasAccessToken && !isLocalPreview });

  const continueToSurvey = async () => {
    const normalizedDepositorName = depositorName.trim();
    if (normalizedDepositorName.length < 2) {
      toast.error("입금자명을 2자 이상 입력해주세요.");
      return;
    }
    try {
      const requestedAt = new Date().toISOString();
      const request = isLocalPreview
        ? {
            requestId: "preview",
            depositorName: normalizedDepositorName,
            amount: 2500,
            currencyCode: "KRW",
            status: "PENDING",
            requestedAt,
          }
        : await createRequest.mutateAsync({ depositorName: normalizedDepositorName });
      localStorage.setItem(PREMIUM_BANK_TRANSFER_PENDING_KEY, JSON.stringify({
        ...request,
        depositorName: request.depositorName ?? normalizedDepositorName,
        amount: request.amount ?? 2500,
        createdAt: request.requestedAt ?? requestedAt,
        status: request.status ?? "PENDING",
      }));
      navigate(
        isLocalPreview
          ? "/premium/bank-transfer/survey-complete?preview=1"
          : "/premium/bank-transfer/survey-complete",
        {
          state: {
            bankTransferManual: true,
            depositorName: request.depositorName ?? normalizedDepositorName,
          },
        },
      );
    } catch (error) {
      const responseError = error.response?.data;
      toast.error(
        responseError?.depositorName?.[0] ??
          responseError?.detail ??
          error.message ??
          "입금 확인 요청을 등록하지 못했어요.",
      );
    }
  };

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(PREMIUM_BANK_TRANSFER_ACCOUNT.accountNumber);
      toast.success("계좌번호를 복사했어요.");
    } catch {
      toast.error("계좌번호를 복사하지 못했어요.");
    }
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] bg-white px-[21px] pt-[73px] text-[#353331]">
        <Header back />
        <h1 className="ml-[6px] mt-[15px] text-[28px] font-semibold leading-[1.4] tracking-[-0.84px]">
          계좌이체 안내
        </h1>
        <p className="ml-[2px] mt-[1px] whitespace-nowrap text-[16px] font-medium leading-[1.38] tracking-[-0.48px] text-[#A5A4A3]">
          입금 완료 버튼을 누르시면 프리미엄 설문으로 넘어가요
        </p>

        <section
          className="mt-[28px] flex flex-col items-start gap-[15px] rounded-[13px] border-[1.5px] border-[#E9E8E8] px-4 py-[19px]"
          aria-label="입금 계좌 안내"
        >
          <h2 className="text-[16px] font-bold leading-[21.44px] tracking-[-0.4288px]">입금 계좌</h2>
          <div className="flex h-[21.44px] w-full items-center justify-between text-[14px] leading-[19.296px] tracking-[-0.4288px]">
            <p>계좌번호 | {PREMIUM_BANK_TRANSFER_ACCOUNT.accountNumber}</p>
            <button type="button" onClick={copyAccountNumber} aria-label="계좌번호 복사" className="flex h-[24px] w-[24px] shrink-0 items-center justify-center">
              <img src={copyAccountIcon} alt="" aria-hidden="true" />
            </button>
          </div>
          <p className="text-[14px] leading-[19.296px] tracking-[-0.4288px]">입금 은행 | {PREMIUM_BANK_TRANSFER_ACCOUNT.bankName}</p>
          <p className="text-[14px] leading-[19.296px] tracking-[-0.4288px]">예금주 | {PREMIUM_BANK_TRANSFER_ACCOUNT.accountHolder}</p>
          <p className="text-[14px] leading-[19.296px] tracking-[-0.4288px]">입금 금액 | {PREMIUM_PLAN.priceLabel.replace(/^₩/, "")}원</p>
        </section>

        <section className="mt-[19px] h-[149px] rounded-[13px] border-[1.5px] border-[#E9E8E8] px-4 pt-[16px]" aria-label="입금자명 입력">
          <h2 className="text-[16px] font-bold leading-[21px] tracking-[-0.4288px]">입금자명을 입력해주세요</h2>
          <p className="mt-[7px] whitespace-nowrap text-[14px] font-medium leading-[19.296px] tracking-[-0.4288px] text-[#A5A4A3]">
            반드시 계좌 이체 후 입금자명을 입력해주세요.
          </p>
          <label className="sr-only" htmlFor="premium-depositor-name">입금자명</label>
          <input
            id="premium-depositor-name"
            value={depositorName}
            onChange={(event) => setDepositorName(event.target.value)}
            maxLength={30}
            placeholder="입금자명을 입력해주세요"
            className="mt-[18px] h-[45px] w-full rounded-[10px] border-2 border-[#E9E8E8] px-[22px] text-[14px] font-semibold tracking-[-0.14px] outline-none placeholder:text-[#BCBBBA] focus:border-main"
          />
        </section>

        <div className="absolute bottom-[69px] left-1/2 w-[calc(100%-50px)] max-w-[345px] -translate-x-1/2">
          <Button
            onClick={continueToSurvey}
            disabled={depositorName.trim().length < 2 || createRequest.isPending}
            className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]"
          >
            {createRequest.isPending ? "요청 중..." : "입금 완료"}
          </Button>
        </div>
      </main>
    </MobileLayout>
  );
}
