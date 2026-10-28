import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../../components/Button";
import MobileLayout from "../../components/MobileLayout";
import loadingCloud from "../../assets/images/fortune/loading_cloud.png";
import sleepingCharacter from "../../assets/images/fortune/loading_sleeping_character.png";
import loadingDots from "../../assets/icons/loading-dots.svg";
import { createFortuneProfile, fetchTodayFortune } from "../../api/fortune";
import queryKeys from "../../api/queryKeys";

export default function WeatherFortuneLoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const profilePayload = location.state?.profilePayload;
  const [attempt, setAttempt] = useState(0);
  const [preparationError, setPreparationError] = useState(null);
  const fortuneQuery = useQuery({
    queryKey: queryKeys.todayFortune,
    queryFn: fetchTodayFortune,
    retry: false,
    enabled: !profilePayload,
  });

  useEffect(() => {
    if (profilePayload) return;
    if (fortuneQuery.data && !fortuneQuery.isFetching) navigate("/weather-fortune/result", { replace: true });
    else if (
      fortuneQuery.error?.response?.status === 409 &&
      fortuneQuery.error?.response?.data?.code === "FORTUNE_PROFILE_REQUIRED"
    ) {
      navigate("/weather-fortune/calendar", { replace: true });
    }
  }, [profilePayload, fortuneQuery.data, fortuneQuery.error, fortuneQuery.isFetching, navigate]);

  useEffect(() => {
    if (!profilePayload) return;
    let cancelled = false;

    const prepareFortune = async () => {
      setPreparationError(null);
      try {
        try {
          await createFortuneProfile(profilePayload);
        } catch (error) {
          const alreadyExists = error.response?.status === 409 &&
            error.response?.data?.code === "FORTUNE_PROFILE_ALREADY_EXISTS";
          if (!alreadyExists) throw error;
        }

        await queryClient.invalidateQueries({ queryKey: queryKeys.fortuneProfile });
        await queryClient.invalidateQueries({ queryKey: queryKeys.todayFortune });
        const fortune = await queryClient.fetchQuery({
          queryKey: queryKeys.todayFortune,
          queryFn: fetchTodayFortune,
          staleTime: 0,
        });
        if (fortune && !cancelled) navigate("/weather-fortune/result", { replace: true });
      } catch (error) {
        if (!cancelled) setPreparationError(error);
      }
    };

    prepareFortune();
    return () => {
      cancelled = true;
    };
  }, [attempt, navigate, profilePayload, queryClient]);

  const loading = profilePayload || fortuneQuery.isPending || fortuneQuery.isFetching;
  const error = preparationError ?? (!profilePayload ? fortuneQuery.error : null);

  return (
    <MobileLayout>
      <main
        className="relative mx-auto min-h-[852px] w-full max-w-[390px] overflow-hidden text-[#353331]"
        style={{
          backgroundImage:
            "linear-gradient(158.32deg, #fff 3.3%, #f9f4fe 24.56%, #dcf4fc 67.5%, #fff 99.09%)",
        }}
      >
        <h1 className="absolute left-0 right-0 top-[145px] text-center text-[30px] font-semibold leading-[1.4] tracking-[-0.9px]">
          사주를 분석하고 있어요!
        </h1>
        <p className="absolute left-0 right-0 top-[207px] text-center text-[18px] font-medium leading-[1.5] tracking-[-0.54px] text-[#BCBBBA]">
          조금만 기다려주시면 테루테루 보즈가
          <br />
          특별한 사주를 말해줄 거예요
        </p>

        <img
          src={loadingCloud}
          alt=""
          aria-hidden="true"
          style={{ top: 363, left: "50%", width: 280, height: 187, transform: "translateX(-50%)" }}
          className="absolute max-w-none object-contain"
        />
        <img
          src={sleepingCharacter}
          alt="구름 위에서 잠든 테루테루 보즈"
          style={{ top: 323, left: "50%", width: 304, height: 160, transform: "translateX(-50%)" }}
          className="absolute max-w-none object-contain"
        />
        {loading ? (
          <img
            src={loadingDots}
            alt="분석 중"
            style={{ top: 585, left: "50%", width: 48, height: 48, transform: "translateX(-50%)" }}
            className="absolute animate-pulse"
          />
        ) : error && error?.response?.status !== 409 ? (
          <div className="absolute left-6 right-6 top-[575px] flex flex-col items-center gap-3 text-center">
            <p role="alert" className="text-sm text-[#797776]">운세를 불러오지 못했어요. 다시 시도해주세요.</p>
            <Button
              onClick={() => profilePayload ? setAttempt((current) => current + 1) : fortuneQuery.refetch()}
              className="!h-[44px] !w-full text-base"
            >
              다시 시도
            </Button>
          </div>
        ) : null}
      </main>
    </MobileLayout>
  );
}
