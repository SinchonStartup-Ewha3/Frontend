import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BottomNav from "../../components/BottomNav";
import CouponRegistrationSheet from "../../components/CouponRegistrationSheet";
import FortunePaymentSheet from "../../components/FortunePaymentSheet";
import MobileLayout from "../../components/MobileLayout";
import lockIcon from "../../assets/icons/fortune-lock.svg";
import FortuneCharacterImage from "../../components/FortuneCharacterImage";
import FortuneDetailContent from "../../components/FortuneDetailContent";
import { fetchTodayFortune, redeemFortuneCoupon } from "../../api/fortune";
import queryKeys from "../../api/queryKeys";

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
  const isFortuneLocked = fortune?.detail_locked ?? true;
  const luckyDetails = [
    { label: "행운컬러", value: fortune?.lucky_color ?? "네이비" },
    { label: "행운아이템", value: fortune?.lucky_item ?? "투명우산" },
    { label: "행운장소", value: fortune?.lucky_place ?? "서점" },
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
      <main className="relative mx-auto min-h-screen w-full max-w-[402px] bg-white text-[#353331]">
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
          이번달 나의 운세는
        </p>
        <h1 className="absolute left-0 right-0 top-[123px] text-center text-[30px] font-semibold leading-[1.4] tracking-[-0.9px]">
          {fortune?.title ??
            (fortuneQuery.isPending
              ? "오늘의 운세를 불러오는 중..."
              : "운세를 불러오지 못했어요.")}
        </h1>

        <div className="absolute left-1/2 top-[209px] h-[182px] w-[167px] -translate-x-1/2 overflow-hidden">
          <FortuneCharacterImage
            fortune={fortune}
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

        <h2 className="absolute left-6 top-[537px] text-[18px] font-semibold leading-[1.38] tracking-[-0.54px]">
          상세 풀이
        </h2>
        <section aria-label="운세 상세 풀이" className="absolute left-0 right-0 top-[575px] px-6 pb-[120px]">
          {isFortuneLocked ? (
            <div className="pointer-events-none select-none blur-[5px]" aria-hidden="true">
              <div className="space-y-[13px]">
                {["업무운", "연애운", "금전운", "건강운"].map((label) => (
                  <article key={label} className="rounded-[20px] border border-[#D2D2D1]/60 px-[33px] pb-5 pt-[17px]">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-[7px] text-[14px] font-semibold"><span className="h-[6px] w-[6px] rounded-full bg-[#60E1FF]" />{label}</h3>
                      <span className="text-[#60E1FF]">••••<span className="text-[#E9E8E8]">•</span></span>
                    </div>
                    <p className="mt-2 text-[12px] font-semibold">오늘의 흐름을 확인해보세요</p>
                    <p className="mt-2 text-[12px] leading-[1.5] text-[#797776]">이용권을 등록하면 자세한 운세 풀이를 확인할 수 있어요.</p>
                  </article>
                ))}
              </div>
            </div>
          ) : <FortuneDetailContent fortune={fortune} />}
          {isFortuneLocked && (
            <div className="absolute inset-x-6 top-0 flex min-h-[188px] flex-col items-center justify-center gap-[6px] rounded-[20px] bg-white/75">
              <img src={lockIcon} alt="" aria-hidden="true" className="h-[22px] w-[17px]" />
              <button type="button" onClick={() => setIsPaymentSheetOpen(true)} className="text-[14px] font-medium underline underline-offset-2">
                결제하러 가기
              </button>
              <button type="button" onClick={() => setIsCouponDialogOpen(true)} className="text-[12px] font-medium text-[#797776] underline underline-offset-2">
                이용권 코드 등록하기
              </button>
            </div>
          )}
          <section aria-label="오늘의 한 줄" className="relative mt-[13px] rounded-[20px] border border-[#60E1FF]/70 bg-[linear-gradient(107deg,#fff_10.54%,#8AE9FF_133.72%)] px-6 pb-5 pt-[17px]">
            <p className="text-[12px] font-semibold leading-[1.5] tracking-[-0.36px] text-[#60CDE8]">오늘의 한 줄</p>
            <p className="mt-[8px] text-[14px] font-semibold leading-[1.5] tracking-[-0.42px]">{fortune?.summary ?? "오늘은 나아가기보다 젖지 않게 지키는 날입니다."}</p>
            <p className="mt-[2px] text-[12px] font-medium leading-[1.5] tracking-[-0.36px] text-[#62605F]">{fortune?.lucky_color ? `${fortune.lucky_color}처럼 차분한 색을 곁에 두고,` : "주변의 기운을 살피며"} 속도를 한 템포만 낮춰보는 건 어떨까요?</p>
          </section>
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
            className="fixed left-1/2 top-[65px] z-30 -translate-x-1/2 rounded-full bg-[#353331] px-4 py-2 text-[13px] text-white"
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
