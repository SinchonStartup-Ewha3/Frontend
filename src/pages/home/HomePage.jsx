import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BottomNav from "../../components/BottomNav";
import Button from "../../components/Button";
import Card from "../../components/Card";
import InputField from "../../components/InputField";
import MobileLayout from "../../components/MobileLayout";
import cloudyMorning from "../../assets/icons/cloudy_morning.svg";
import cloudyNight from "../../assets/icons/cloudy_night.svg";
import checkIcon from "../../assets/icons/check.svg";
import sunnyMorning from "../../assets/icons/sunny_morning.svg";
import moonIcon from "../../assets/icons/moon.svg";
import searchIcon from "../../assets/icons/search.svg";
import starIcon from "../../assets/icons/star.svg";
import timeIcon from "../../assets/icons/time.svg";
import rainCharacter from "../../assets/images/weather/weather_rain_character.svg";
import cloudCharacter from "../../assets/images/weather/weather_cloud_character.svg";
import snowCharacter from "../../assets/images/weather/weather_snow_character.svg";
import windCharacter from "../../assets/images/weather/weather_wind_character.svg";
import sunnyCharacter from "../../assets/images/weather/weather_sunny_character.svg";
import raindropIcon from "../../assets/icons/raindrop_icon.svg";
import snowflakeIcon from "../../assets/icons/snowflake_icon.svg";
import { searchRegions, updateUserLocation } from "../../api/location";
import { fetchHomeData } from "../../api/weather";
import queryKeys from "../../api/queryKeys";
import { useCurrentRegion, useRegionSearch } from "../../hooks/useLocation";
import useToast from "../../hooks/useToast";
import useUserStore from "../../store/useUserStore";
import useLocationStore from "../../store/useLocationStore";
import LoginRequiredModal from "../../components/LoginRequiredModal";

const formatTemperature = (value) =>
  value == null ? "--" : `${Number(value).toFixed(1).replace(/\.0$/, "")}°`;

const getWeatherIcon = (condition, isNight) => {
  switch (condition) {
    case "CLEAR":
      return isNight ? moonIcon : sunnyMorning;
    case "PARTLY_CLOUDY":
    case "CLOUDY":
      return isNight ? cloudyNight : cloudyMorning;
    case "RAIN":
    case "SHOWER":
    case "SLEET":
      return raindropIcon;
    case "SNOW":
      return snowflakeIcon;
    default:
      return isNight ? cloudyNight : cloudyMorning;
  }
};

const getCharacterImage = (state) => {
  switch (state) {
    case "SNOWY":
      return snowCharacter;
    case "RAINY":
      return rainCharacter;
    case "COLD":
      return windCharacter;
    case "HOT":
      return sunnyCharacter;
    default:
      return cloudCharacter;
  }
};

const recentLocations = [
  "서울 특별시 서대문구 아현동",
  "부산광역시 사하구",
  "서울 특별시 강남구",
];

export default function HomePage() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.user);
  const selectedRegion = useLocationStore((state) => state.selected);
  const selectedRegionCode = selectedRegion?.regionCode;
  const hasAccessToken = Boolean(localStorage.getItem("wee_access_token"));
  const selectRegion = useLocationStore((state) => state.selectRegion);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [hasEditedSearch, setHasEditedSearch] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [location, setLocation] = useState(
    () => selectedRegion?.shortName ?? selectedRegion ?? currentUser?.region?.shortName ?? currentUser?.region ?? "서대문구 아현동",
  );
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const { locate, loading: locating } = useCurrentRegion();
  const { data: regionResults = [], isError: regionSearchFailed } =
    useRegionSearch(locationQuery);
  const {
    data: homeData,
    isLoading: isHomeLoading,
    isError: isHomeError,
    refetch: refetchHome,
  } = useQuery({
    queryKey: [...queryKeys.home, hasAccessToken ? "me" : selectedRegionCode ?? "unselected"],
    queryFn: () => fetchHomeData({
      regionCode: hasAccessToken ? undefined : selectedRegionCode,
      skipAuth: !hasAccessToken,
    }),
    enabled: hasAccessToken || Boolean(selectedRegionCode),
    retry: false,
  });
  const toast = useToast();
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);
  const normalizedQuery = locationQuery.trim();
  const isSearchingRegions = isSearchActive && hasEditedSearch && normalizedQuery.length > 0;
  const weather = homeData?.weather;
  const forecast = [
    ...(weather
      ? [
          {
            time: "지금",
            temperature: weather.temperature,
            precipitation: `${weather.precipitation ?? 0}mm`,
            condition: weather.condition,
            conditionLabel: weather.conditionLabel,
            isNight: weather.isNight,
          },
        ]
      : []),
    ...(homeData?.hourly ?? []).map((item) => ({
      time: `${String(item.hour).padStart(2, "0")}시`,
      temperature: item.temperature,
      precipitation: `${Math.round(item.precipitationProbability)}%`,
      condition: item.condition,
      conditionLabel: item.conditionLabel,
      isNight: item.isNight,
    })),
  ];

  useEffect(() => {
    const regionName = selectedRegion?.shortName ?? selectedRegion ?? homeData?.region?.shortName;
    if (regionName) setLocation(regionName);
    if (!hasAccessToken && !selectedRegionCode) setIsLocationPickerOpen(true);
  }, [hasAccessToken, homeData?.region?.shortName, selectedRegion, selectedRegionCode]);

  const handleRegionSelection = async (region) => {
    if (isSelectingLocation) return;
    if (!localStorage.getItem("wee_access_token")) {
      selectRegion({ ...region, shortName: region.shortName });
      setLocation(region.shortName);
      setIsLocationPickerOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.home });
      return;
    }
    setIsSelectingLocation(true);
    try {
      const user = await updateUserLocation({
        locationMode: "MANUAL",
        regionCode: region.regionCode,
      });
      setUser(user);
      queryClient.setQueryData(queryKeys.profile, user);
      queryClient.invalidateQueries({ queryKey: queryKeys.home });
      setLocation(user.region?.shortName ?? region.shortName);
      setIsLocationPickerOpen(false);
    } catch (error) {
      toast.error(
        error.response?.data?.regionCode?.[0] ??
          error.response?.data?.location?.[0] ??
          "지역을 설정하지 못했어요. 다시 시도해 주세요.",
      );
    } finally {
      setIsSelectingLocation(false);
    }
  };

  const handleRecentSelection = async (recentLocation) => {
    try {
      const candidates = await searchRegions(recentLocation);
      const normalizedRecent = recentLocation.replace(/\s+/g, "");
      const region =
        candidates.find(
          (candidate) =>
            candidate.regionName.replace(/\s+/g, "") === normalizedRecent ||
            candidate.shortName.replace(/\s+/g, "") === normalizedRecent,
        ) ?? candidates[0];
      if (!region) {
        toast.error("지역을 찾지 못했어요. 검색해서 다시 선택해 주세요.");
        return;
      }
      await handleRegionSelection(region);
    } catch {
      toast.error("지역 검색에 실패했어요. 다시 시도해 주세요.");
    }
  };

  const handleLocate = async () => {
    if (!localStorage.getItem("wee_access_token")) {
      toast.error("현재 위치 저장은 로그인 후 사용할 수 있어요. 지역 검색은 계속 이용할 수 있어요.");
      return;
    }
    const region = await locate();
    if (!region) {
      toast.error("현재 위치를 설정하지 못했어요. 위치 권한을 확인해 주세요.");
      return;
    }
    setLocation(region);
    queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    queryClient.invalidateQueries({ queryKey: queryKeys.home });
    setIsLocationPickerOpen(false);
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[390px] overflow-hidden bg-white text-[#353331]">
        <button
          type="button"
          onClick={() => {
            setLocationQuery("");
            setIsSearchActive(false);
            setHasEditedSearch(false);
            setIsLocationPickerOpen(true);
          }}
          aria-label={`현재 위치 ${location}, 위치 선택 열기`}
          className="absolute left-[27px] top-[82px] flex items-center gap-2 text-[18px] font-medium tracking-[-0.54px]"
        >
          <span>{location}</span>
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="m3 4.5 3 3 3-3" stroke="#A5A4A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <img
          src={weather ? getWeatherIcon(weather.condition, weather.isNight) : moonIcon}
          alt=""
          aria-hidden="true"
          className="absolute left-[24px] top-[129px] h-6 w-6 object-contain"
        />
        <p className="absolute left-[65px] top-[121px] text-[36px] font-semibold leading-[normal] text-[#1F1C1A]">
          {formatTemperature(weather?.temperature)}
        </p>
        <div className="absolute left-[155px] top-[129px]">
          <p className="whitespace-nowrap text-[12px] font-semibold leading-[normal] text-[#1F1C1A]">체감기온 {formatTemperature(weather?.feelsLike)}</p>
          <p className="mt-[2px] flex items-center gap-[7px] whitespace-nowrap text-[10px] font-medium leading-[normal] text-[#1F1C1A]">
            <span>{formatTemperature(weather?.minTemperature)}</span>
            <span className="h-[2px] w-[18px] rounded-full bg-gradient-to-r from-[#60E1FF] to-[#B1F0FE]" />
            <span>{formatTemperature(weather?.maxTemperature)}</span>
          </p>
        </div>
        <div className="absolute left-1/2 top-[217px] h-[218px] w-[201px] -translate-x-1/2 overflow-hidden">
          <img
            src={getCharacterImage(homeData?.character?.state)}
            alt={homeData?.character?.label ?? "오늘의 날씨 캐릭터"}
            className="origin-top-left scale-[0.67] max-w-none"
          />
        </div>
        <div className="absolute left-1/2 top-[459px] flex h-[39px] w-[229px] -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-r from-[#60E1FF] to-[#B1F0FE]">
          <span className="whitespace-nowrap text-[16px] font-semibold tracking-[-0.48px] text-white">
            {homeData?.message ?? (isHomeLoading ? "날씨 정보를 불러오는 중..." : "오늘의 날씨를 확인해 보세요!")}
          </span>
        </div>
        <Card className="absolute left-1/2 top-[517px] h-[116px] w-[355px] -translate-x-1/2 !rounded-[20px] !border !border-[#E9E8E8]/60 !p-0">
          <div className="absolute inset-x-[10px] top-[16px] flex gap-[5px] overflow-x-auto pb-2" aria-label="시간대별 날씨">
            {forecast.map((item, index) => (
              <div key={`${item.time}-${index}`} className="flex w-[55px] shrink-0 flex-col items-center">
                <span className="whitespace-nowrap text-[12px] font-medium leading-none text-[#4C4A48]">
                  {item.time}
                </span>
                <img
                  src={getWeatherIcon(item.condition, item.isNight)}
                  alt={item.conditionLabel ?? item.condition}
                  className="mt-[10px] h-[26px] w-[26px] object-contain"
                />
                <span className="mt-[7px] text-[12px] font-semibold leading-none text-[#353331]">
                  {formatTemperature(item.temperature)}
                </span>
                <span className="mt-[8px] flex items-center gap-[3px] text-[9px] font-medium leading-none text-[#797776]">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 12 14"
                    fill="none"
                    className="h-[10px] w-[9px]"
                  >
                    <path
                      d="M6 1C4.7 3.3 2 6.1 2 8.7a4 4 0 0 0 8 0C10 6.1 7.3 3.3 6 1Z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item.precipitation}
                </span>
              </div>
            ))}
            {!forecast.length && (
              <p className="w-full py-6 text-center text-sm text-[#A5A4A3]">
                {isHomeError ? (
                  <button type="button" onClick={() => refetchHome()} className="underline">
                    날씨를 불러오지 못했어요. 다시 시도
                  </button>
                ) : "날씨 정보를 불러오는 중..."}
              </p>
            )}
          </div>
        </Card>
        <Card className="absolute left-1/2 top-[645px] h-[80px] w-[345px] -translate-x-1/2 !rounded-[20px] !border-0 !p-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]">
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-[rgba(240,227,255,0.2)] to-[rgba(5,196,240,0.2)]" />
          <p className="absolute left-[23px] top-[17px] text-[16px] font-semibold leading-[1.5] tracking-[-0.48px] text-[#62605F]">
            오늘의 날씨 운세
          </p>
          <p className="absolute left-[23px] top-[44px] text-[12px] font-medium leading-[1.5] tracking-[-0.36px] text-[#8F8E8D]">
            오늘 나의 날씨 운세는 몇점일까?
          </p>
          <img
            src={starIcon}
            alt=""
            aria-hidden="true"
            className="absolute right-[24px] top-[27px] max-w-none"
          />
          <button
            type="button"
            aria-label="오늘의 날씨 운세 열기"
            onClick={() => localStorage.getItem("wee_access_token")
              ? navigate("/weather-fortune")
              : setIsLoginPromptOpen(true)}
            className="absolute inset-0 z-10 rounded-[20px]"
          />
        </Card>
        <BottomNav />
      </main>
      {isLocationPickerOpen && (
        <div className="fixed inset-0 z-50 flex justify-center" role="presentation">
          <button
            type="button"
            aria-label="위치 선택 닫기"
            onClick={() => setIsLocationPickerOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-label="위치 선택"
            className="absolute top-[153px] bottom-0 w-full max-w-[390px] overflow-y-auto rounded-t-[20px] bg-white"
          >
            {isSearchActive ? (
              <div className="absolute left-1/2 top-[49px] flex w-[345px] -translate-x-1/2 items-center gap-[8px]">
                <InputField
                  autoFocus
                  value={locationQuery}
                  onChange={(event) => {
                    setLocationQuery(event.target.value);
                    setHasEditedSearch(true);
                  }}
                  placeholder="지역명을 검색하세요"
                  aria-label="지역명 검색"
                  className="!h-[60px] !w-[303px] !rounded-[15px] border-0 !bg-[#F4F4F4] px-[18px] text-[18px] !font-semibold text-[#4C4A48]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchActive(false);
                    setHasEditedSearch(false);
                    setLocationQuery("");
                  }}
                  className="shrink-0 text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-[#60E1FF]"
                >
                  취소
                </button>
              </div>
            ) : (
              <>
                <div className="absolute left-6 right-6 top-[49px]">
                  <div className="relative">
                    <img
                      src={searchIcon}
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute left-[30px] top-1/2 z-10 -translate-y-1/2"
                    />
                    <InputField
                      value={locationQuery}
                      onChange={(event) => setLocationQuery(event.target.value)}
                      onFocus={() => {
                        setIsSearchActive(true);
                        setHasEditedSearch(false);
                        setLocationQuery("");
                      }}
                      placeholder="지역명을 검색하세요"
                      aria-label="지역명 검색"
                      className="!h-[60px] !rounded-[15px] border-0 !bg-[#F4F4F4] px-[18px] text-[18px] placeholder:text-center"
                    />
                  </div>
                </div>
                <Button
                  variant="soft"
                  onClick={handleLocate}
                  disabled={locating}
                  className="absolute left-6 right-6 top-[125px] !h-[44px] !w-[calc(100%-48px)] rounded-[10px] text-[18px] tracking-[-0.18px]"
                >
                  {locating ? "위치 확인 중..." : "현재 위치로 찾기"}
                </Button>
                <h2 className="absolute left-6 top-[191px] text-[18px] font-semibold leading-[1.5] tracking-[-0.54px] text-[#4C4A48]">
                  최근 검색
                </h2>
              </>
            )}
            <div className={`absolute ${isSearchActive ? "left-[30px] right-[30px] top-[126px]" : "left-6 right-6 top-[232px]"}`}>
              {isSearchingRegions && regionSearchFailed && (
                <p role="alert" className="py-4 text-center text-sm text-[#A5A4A3]">
                  지역 검색에 실패했어요. 다시 시도해 주세요.
                </p>
              )}
              {isSearchingRegions && normalizedQuery.length < 2 && (
                <p className="py-4 text-center text-sm text-[#A5A4A3]">
                  두 글자 이상 입력해 주세요.
                </p>
              )}
              {isSearchingRegions && normalizedQuery.length >= 2 && regionResults.length === 0 && !regionSearchFailed && (
                <p className="py-4 text-center text-sm text-[#A5A4A3]">
                  검색 결과가 없어요.
                </p>
              )}
              {(isSearchingRegions ? regionResults : recentLocations).map((item) => {
                const isSearchResult = typeof item !== "string";
                const label = isSearchResult ? item.regionName : item;
                const shortLocation = isSearchResult
                  ? item.shortName
                  : item.replace("서울 특별시 ", "");
                const isSelected = shortLocation === location;

                return (
                  <button
                    type="button"
                    key={isSearchResult ? item.regionCode : item}
                    disabled={isSelectingLocation}
                    onClick={() =>
                      isSearchResult
                        ? handleRegionSelection(item)
                        : handleRecentSelection(item)
                    }
                    className="flex min-h-[47px] w-full items-center gap-[14px] text-left text-[18px] font-medium leading-[1.5] tracking-[-0.54px] text-[#797776] disabled:opacity-50"
                  >
                    {isSearchResult ? (
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] shrink-0 text-[#E9E8E8]">
                        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.7" />
                        <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    ) : (
                      <img src={timeIcon} alt="" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1">{label}</span>
                    {isSelected && (
                      <img
                        src={checkIcon}
                        alt="현재 설정된 위치"
                        className="mr-1 shrink-0"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}
      <LoginRequiredModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        onLogin={() => navigate("/consent", { state: { intent: "kakao", from: "/weather-fortune" } })}
      />
    </MobileLayout>
  );
}
