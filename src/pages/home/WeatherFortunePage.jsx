import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../../components/Button";
import Card from "../../components/Card";
import CouponRegistrationSheet from "../../components/CouponRegistrationSheet";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import wizardCharacter from "../../assets/images/fortune/fortune_wizard.svg";
import angelCharacter from "../../assets/images/fortune/fortune_angel.svg";
import crownCharacter from "../../assets/images/fortune/fortune_crown.svg";
import detectiveCharacter from "../../assets/images/fortune/fortune_detective.svg";
import travelerCharacter from "../../assets/images/fortune/fortune_traveler.svg";
import { fetchFortuneProfile, fetchTodayFortune, redeemFortuneCoupon } from "../../api/fortune";
import queryKeys from "../../api/queryKeys";

const luckCharacters = {
  GREAT: crownCharacter,
  GOOD: angelCharacter,
  NORMAL: travelerCharacter,
  CAUTION: detectiveCharacter,
  BAD: wizardCharacter,
};

export default function WeatherFortunePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem("wee_access_token"));
  const profileQuery = useQuery({
    queryKey: queryKeys.fortuneProfile,
    queryFn: fetchFortuneProfile,
    retry: false,
    enabled: isLoggedIn,
  });
  const fortuneQuery = useQuery({
    queryKey: queryKeys.todayFortune,
    queryFn: fetchTodayFortune,
    retry: false,
    enabled: !isLoggedIn || profileQuery.isSuccess,
  });
  const fortune = fortuneQuery.data;

  useEffect(() => {
    if (profileQuery.error?.response?.status === 404 && profileQuery.error?.response?.data?.code === "FORTUNE_PROFILE_NOT_FOUND") {
      navigate("/weather-fortune/calendar", { replace: true });
    }
  }, [profileQuery.error, navigate]);

  useEffect(() => {
    if (fortuneQuery.error?.response?.status === 409 && fortuneQuery.error?.response?.data?.code === "FORTUNE_PROFILE_REQUIRED") {
      navigate("/weather-fortune/calendar", { replace: true });
    }
  }, [fortuneQuery.error, navigate]);

  const handleCouponRegister = async (code) => {
    const result = await redeemFortuneCoupon(code);
    await queryClient.invalidateQueries({ queryKey: queryKeys.todayFortune });
    await queryClient.invalidateQueries({ queryKey: queryKeys.fortunePurchases });
    return result;
  };

  return (
    <MobileLayout>
      <main
        className="relative mx-auto min-h-[852px] w-full max-w-[390px] overflow-hidden text-[#353331]"
        style={{
          backgroundImage:
            "linear-gradient(158.32deg, #fff 3.3%, #f9f4fe 24.56%, #dcf4fc 67.5%, #fff 99.09%)",
        }}
      >
        <div className="absolute left-5 right-5 top-[73px] z-10">
          <Header back />
        </div>

        <p className="absolute left-0 right-0 top-[111px] text-center text-[16px] font-medium leading-[1.5] tracking-[-0.48px] text-[#BCBBBA]">
          오늘 나의 운세가 궁금하다면?
        </p>

        <h1 className="absolute left-0 right-0 top-[145px] text-center text-[30px] font-semibold leading-[1.4] tracking-[-0.9px]">
          {fortune?.weather_label ?? "오늘의 운세"}
          <br />
          오늘의 운세를 확인해봐요
        </h1>

        <div
          aria-hidden="true"
          className="absolute left-[calc(50%-190px)] top-[290px] h-[243px] w-[171px] rotate-[-13.56deg] rounded-[21px] bg-white/50"
        />
        <div
          aria-hidden="true"
          className="absolute left-[calc(50%+20px)] top-[290px] h-[243px] w-[171px] rotate-[13.56deg] rounded-[21px] bg-white/50"
        />

        <Card className="absolute left-1/2 top-[277px] z-10 h-[268px] w-[188px] -translate-x-1/2 !rounded-[23px] !border-0 !p-0 shadow-[0_3px_5px_rgba(53,51,49,0.12)]">
          <p className="absolute left-0 right-0 top-[24px] text-center text-[14px] font-semibold leading-[1.38] tracking-[-0.42px] text-[#62605F]">
            {fortune?.title ?? (fortuneQuery.isPending ? "오늘의 운세를 불러오는 중" : "오늘 운세")}
          </p>
          <div className="absolute left-1/2 top-[72px] h-[134px] w-[111px] -translate-x-1/2">
            <img
              src={luckCharacters[fortune?.luck_level] ?? travelerCharacter}
              alt={`${fortune?.luck_label ?? "오늘 운세"} 테루테루 캐릭터`}
              className="absolute left-1/2 top-0 max-w-none -translate-x-1/2 origin-top scale-[0.621]"
            />
          </div>
          <p className="absolute left-0 right-0 top-[210px] text-center text-[12px] font-medium leading-[1.5] tracking-[-0.36px] text-[#A5A4A3]">
            {fortune?.summary ?? (fortuneQuery.isError ? "운세를 불러오지 못했어요." : "오늘의 운세를 준비하고 있어요.")}
          </p>
        </Card>

        <Button
          variant="white"
          onClick={() => navigate("/weather-fortune/result")}
          disabled={(isLoggedIn && (profileQuery.isPending || profileQuery.isError)) || fortuneQuery.isPending || fortuneQuery.isError}
          className="absolute left-1/2 top-[611px] !h-[44px] !w-[345px] -translate-x-1/2 rounded-[10px] text-[18px] tracking-[-0.18px]"
        >
          {(isLoggedIn && profileQuery.isPending) || fortuneQuery.isPending ? "운세를 불러오는 중..." : "오늘의 운세 보기"}
        </Button>
        {((isLoggedIn && profileQuery.isError) || fortuneQuery.isError) && (
          <button type="button" onClick={() => isLoggedIn && profileQuery.isError ? profileQuery.refetch() : fortuneQuery.refetch()} className="absolute left-1/2 top-[658px] -translate-x-1/2 text-xs text-[#797776] underline">
            다시 시도
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsCouponDialogOpen(true)}
          className="absolute left-1/2 top-[680px] -translate-x-1/2 whitespace-nowrap text-[16px] font-medium leading-[1.5] tracking-[-0.48px] text-[#A5A4A3]"
        >
          코드 등록 하러가기
        </button>
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[703px] h-px w-[112px] -translate-x-1/2 bg-[#D2D2D1]"
        />
      </main>
      <CouponRegistrationSheet
        isOpen={isCouponDialogOpen}
        onClose={() => setIsCouponDialogOpen(false)}
        onRegister={handleCouponRegister}
      />
    </MobileLayout>
  );
}
