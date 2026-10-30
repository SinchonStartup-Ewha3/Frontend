import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BottomNav from "../../components/BottomNav";
import CouponRegistrationSheet from "../../components/CouponRegistrationSheet";
import FortuneCoinChip from "../../components/FortuneCoinChip";
import FortunePaymentSheet from "../../components/FortunePaymentSheet";
import MobileLayout from "../../components/MobileLayout";
import lockIcon from "../../assets/icons/fortune-lock.svg";
import angelFortune from "../../assets/images/fortune/fortune_angel.svg";
import travelerFortune from "../../assets/images/fortune/fortune_traveler.svg";
import crownFortune from "../../assets/images/fortune/fortune_crown.svg";
import detectiveFortune from "../../assets/images/fortune/fortune_detective.svg";
import wizardFortune from "../../assets/images/fortune/fortune_wizard.svg";
import { fetchTodayFortune, redeemFortuneCoupon } from "../../api/fortune";
import queryKeys from "../../api/queryKeys";
import { useFortunePurchasesQuery } from "../../hooks/useFortunePayment";

const luckCharacters = {
  GREAT: crownFortune,
  GOOD: angelFortune,
  NORMAL: travelerFortune,
  CAUTION: detectiveFortune,
  BAD: wizardFortune,
};

export default function WeatherFortuneResultPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [shareMessage, setShareMessage] = useState("");
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const fortuneQuery = useQuery({
    queryKey: queryKeys.todayFortune,
    queryFn: fetchTodayFortune,
    retry: false,
  });
  const fortune = fortuneQuery.data;
  // 코인은 운세를 불러온 뒤에 조회해야 차감 결과가 반영된 값이 와요
  const purchasesQuery = useFortunePurchasesQuery({
    enabled: fortuneQuery.isSuccess,
  });
  const coins = purchasesQuery.data?.coins;
  const { refetch: refetchPurchases } = purchasesQuery;
  const fortuneUpdatedAt = fortuneQuery.dataUpdatedAt;
  // 운세가 새로 갱신될 때마다(결제/쿠폰 직후 포함) 코인도 다시 받아와요
  useEffect(() => {
    if (fortuneUpdatedAt) refetchPurchases();
  }, [fortuneUpdatedAt, refetchPurchases]);
  const isFortuneLocked = fortune?.detail_locked ?? true;
  const luckyDetails = [
    { label: "행운컬러", value: fortune?.lucky_color },
    { label: "행운아이템", value: fortune?.lucky_item },
    { label: "행운장소", value: fortune?.lucky_place },
  ];

  useEffect(() => {
    if (
      fortuneQuery.error?.response?.status === 409 &&
      fortuneQuery.error?.response?.data?.code === "FORTUNE_PROFILE_REQUIRED"
    ) {
      navigate("/weather-fortune/calendar", { replace: true });
    }
  }, [fortuneQuery.error, navigate]);

  const handleCouponRegister = async (code) => {
    const result = await redeemFortuneCoupon(code);
    await queryClient.invalidateQueries({ queryKey: queryKeys.todayFortune });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.fortunePurchases,
    });
    return result;
  };

  const shareResult = async () => {
    const shareData = {
      title: fortune?.title ?? "오늘의 날씨 운세",
      text: fortune?.summary ?? "오늘의 운세와 행운 아이템을 확인해보세요.",
      url: window.location.href,
    };

    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        setShareMessage("링크를 복사했어요");
        window.setTimeout(() => setShareMessage(""), 1800);
      }
    } catch {
      // Sharing can be dismissed by the user without changing this screen.
    }
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] overflow-hidden bg-white pb-[140px] text-[#353331]">
        <button
          type="button"
          aria-label="운세 결과 공유하기"
          onClick={shareResult}
          className="absolute right-[38px] top-[76px] z-10 flex h-6 w-6 items-center justify-center text-[#D2D2D1]"
        >
          <span
            aria-hidden="true"
            className="relative -mt-1 ml-1 h-[13px] w-[13px] border-r-2 border-t-2 border-[#D2D2D1] after:absolute after:-bottom-[3px] after:-left-[4px] after:h-[9px] after:w-[9px] after:border-b-2 after:border-l-2 after:border-[#D2D2D1]"
          >
            ↗
          </span>
        </button>

        <p className="absolute left-0 right-0 top-[97px] text-center text-[16px] font-semibold leading-[1.5] tracking-[-0.48px] text-[#D2D2D1]">
          오늘의 날씨 운세
        </p>
        <h1 className="absolute left-0 right-0 top-[123px] text-center text-[30px] font-semibold leading-[1.4] tracking-[-0.9px]">
          {fortune?.title ??
            (fortuneQuery.isPending
              ? "오늘의 운세를 불러오는 중..."
              : "운세를 불러오지 못했어요.")}
        </h1>

        <div className="absolute left-1/2 top-[209px] h-[182px] w-[167px] -translate-x-1/2 overflow-hidden">
          <img
            src={luckCharacters[fortune?.luck_level] ?? travelerFortune}
            alt={`${fortune?.luck_label ?? "오늘 운세"} 테루테루 캐릭터`}
            className="h-full w-full object-contain"
          />
        </div>

        <section
          aria-label="오늘의 행운 정보"
          className="absolute left-6 right-6 top-[414px] grid grid-cols-3 gap-[14px]"
        >
          {luckyDetails.map((item) => (
            <div
              key={item.label}
              className="flex h-[94px] flex-col items-center rounded-[20px] border border-[#D2D2D1]/60 pt-[18px]"
            >
              <span className="text-[14px] font-medium leading-[1.5] tracking-[-0.42px] text-[#A5A4A3]">
                {item.label}
              </span>
              <span className="mt-[4px] text-center text-[18px] font-semibold leading-[1.38] tracking-[-0.54px]">
                {item.value ?? "-"}
              </span>
            </div>
          ))}
        </section>

        <section
          aria-label="운세 상세 풀이"
          className={`relative mx-6 mt-[521px] min-h-[183px] rounded-[20px] border border-[#D2D2D1]/60 px-[28px] pb-[24px] pt-[17px] ${isFortuneLocked ? "overflow-hidden" : ""}`}
        >
          <h2 className="text-[16px] font-semibold leading-[1.38] tracking-[-0.48px]">
            상세 풀이
          </h2>
          <div
            className={`mt-[18px] whitespace-pre-line text-[16px] font-medium leading-[1.5] tracking-[-0.48px] text-[#62605F] ${isFortuneLocked ? "select-none blur-[5px]" : ""}`}
            aria-hidden={isFortuneLocked}
          >
            {fortune?.detail_text ??
              "상세 운세는 이용권 등록 후 확인할 수 있어요."}
          </div>
          {isFortuneLocked ? (
            <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-[6px]">
              <img
                src={lockIcon}
                alt=""
                aria-hidden="true"
                className="h-[22px] w-[17px]"
              />
              <button
                type="button"
                onClick={() => setIsPaymentSheetOpen(true)}
                className="text-[14px] font-medium leading-[19px] tracking-[-0.42px] text-[#353331] underline underline-offset-2"
              >
                결제하러 가기
              </button>
              <button
                type="button"
                onClick={() => setIsCouponDialogOpen(true)}
                className="text-[12px] font-medium leading-[17px] tracking-[-0.36px] text-[#797776] underline underline-offset-2"
              >
                이용권 코드 등록하기
              </button>
            </div>
          ) : (
            <FortuneCoinChip
              coins={coins}
              className="absolute right-[14px] top-[12px]"
            />
          )}
        </section>

        {fortuneQuery.isError &&
          fortuneQuery.error?.response?.data?.code !==
            "FORTUNE_PROFILE_REQUIRED" && (
            <button
              type="button"
              onClick={() => fortuneQuery.refetch()}
              className="mx-auto mt-[6px] block text-sm text-[#797776] underline"
            >
              {fortuneQuery.error?.response?.data?.detail ?? "다시 시도"}
            </button>
          )}

        {!fortuneQuery.isError && (
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="ml-auto mr-[33px] mt-[9px] block text-[14px] font-semibold leading-[1.5] tracking-[-0.42px] text-[#D2D2D1] underline underline-offset-2"
          >
            홈으로
          </button>
        )}
        <BottomNav activeTo="/home" />
        {shareMessage && (
          <div
            role="status"
            className="absolute left-1/2 top-[65px] z-30 -translate-x-1/2 rounded-full bg-[#353331] px-4 py-2 text-[13px] text-white"
          >
            {shareMessage}
          </div>
        )}
      </main>
      <FortunePaymentSheet
        isOpen={isPaymentSheetOpen}
        onClose={() => setIsPaymentSheetOpen(false)}
        onOpenCoupon={() => {
          setIsPaymentSheetOpen(false);
          setIsCouponDialogOpen(true);
        }}
      />
      <CouponRegistrationSheet
        isOpen={isCouponDialogOpen}
        onClose={() => setIsCouponDialogOpen(false)}
        onRegister={handleCouponRegister}
      />
    </MobileLayout>
  );
}
