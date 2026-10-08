import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const forecast = [
  { time: "02시", temperature: "21°", icon: cloudyNight },
  { time: "지금", temperature: "19°", icon: cloudyMorning },
  { time: "04시", temperature: "21°", icon: sunnyMorning },
  { time: "05시", temperature: "25°", icon: sunnyMorning },
  { time: "06시", temperature: "29°", icon: sunnyMorning },
];

const recentLocations = [
  "서울 특별시 서대문구 아현동",
  "부산광역시 사하구",
  "서울 특별시 강남구",
];

export default function HomePage() {
  const navigate = useNavigate();
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [hasEditedSearch, setHasEditedSearch] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [location, setLocation] = useState("서대문구 아현동");
  const normalizedQuery = locationQuery.trim();
  const filteredLocations =
    isSearchActive && hasEditedSearch && normalizedQuery
      ? recentLocations.filter((item) => item.includes(normalizedQuery))
      : recentLocations;

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
          src={moonIcon}
          alt=""
          aria-hidden="true"
          className="absolute left-[24px] top-[129px]"
        />
        <p className="absolute left-[65px] top-[121px] text-[36px] font-semibold leading-[normal] text-[#1F1C1A]">
          19.2°
        </p>
        <div className="absolute left-[155px] top-[129px]">
          <p className="whitespace-nowrap text-[12px] font-semibold leading-[normal] text-[#1F1C1A]">체감기온 20°</p>
          <p className="mt-[2px] flex items-center gap-[7px] whitespace-nowrap text-[10px] font-medium leading-[normal] text-[#1F1C1A]">
            <span>19°</span>
            <span className="h-[2px] w-[18px] rounded-full bg-gradient-to-r from-[#60E1FF] to-[#B1F0FE]" />
            <span>30°</span>
          </p>
        </div>
        <div className="absolute left-1/2 top-[217px] h-[218px] w-[201px] -translate-x-1/2 overflow-hidden">
          <img
            src={rainCharacter}
            alt="우산을 쓴 WEE 날씨 캐릭터"
            className="origin-top-left scale-[0.67] max-w-none"
          />
        </div>
        <div className="absolute left-1/2 top-[459px] flex h-[39px] w-[229px] -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-r from-[#60E1FF] to-[#B1F0FE]">
          <span className="whitespace-nowrap text-[16px] font-semibold tracking-[-0.48px] text-white">
            날씨가 제법 쌀쌀하니 감기 조심!
          </span>
        </div>
        <Card className="absolute left-1/2 top-[517px] h-[106px] w-[345px] -translate-x-1/2 !rounded-[20px] !border !border-[#E9E8E8]/60 !p-0">
          <div className="absolute inset-x-[10px] top-[16px] grid grid-cols-5">
            {forecast.map((item) => (
              <div key={item.time} className="flex flex-col items-center">
                <span className="whitespace-nowrap text-[12px] font-medium leading-none text-[#4C4A48]">
                  {item.time}
                </span>
                <img src={item.icon} alt="" aria-hidden="true" className="mt-[10px] max-w-none" />
                <span className="mt-[7px] text-[12px] font-semibold leading-none text-[#353331]">
                  {item.temperature}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="absolute left-1/2 top-[635px] h-[80px] w-[345px] -translate-x-1/2 !rounded-[20px] !border-0 !p-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]">
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
            onClick={() => navigate("/weather-fortune")}
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
                  onClick={() => {
                    setLocation("서대문구 아현동");
                    setIsLocationPickerOpen(false);
                  }}
                  className="absolute left-6 right-6 top-[125px] !h-[44px] !w-[calc(100%-48px)] rounded-[10px] text-[18px] tracking-[-0.18px]"
                >
                  현재 위치로 찾기
                </Button>
                <h2 className="absolute left-6 top-[191px] text-[18px] font-semibold leading-[1.5] tracking-[-0.54px] text-[#4C4A48]">
                  최근 검색
                </h2>
              </>
            )}
            <div className={`absolute ${isSearchActive ? "left-[30px] right-[30px] top-[126px]" : "left-6 right-6 top-[232px]"}`}>
              {filteredLocations.map((recentLocation) => {
                const shortLocation = recentLocation.replace("서울 특별시 ", "");
                const isSelected = shortLocation === location;

                return (
                  <button
                    type="button"
                    key={recentLocation}
                    onClick={() => {
                      setLocation(shortLocation);
                      setIsLocationPickerOpen(false);
                    }}
                    className="flex min-h-[47px] w-full items-center gap-[14px] text-left text-[18px] font-medium leading-[1.5] tracking-[-0.54px] text-[#797776]"
                  >
                    {isSearchActive ? (
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] shrink-0 text-[#E9E8E8]">
                        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.7" />
                        <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    ) : (
                      <img src={timeIcon} alt="" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1">{recentLocation}</span>
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
    </MobileLayout>
  );
}
