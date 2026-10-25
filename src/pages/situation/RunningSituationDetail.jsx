import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import Chip from "../../components/Chip";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import StatBox from "../../components/StatBox";
import {
  useRunningQuery,
  useSituationLocation,
} from "../../hooks/useSituation";
import {
  formatPercent,
  formatTemperature,
  formatTimeRange,
  getDayLabel,
  getErrorMessage,
} from "../../utils/situation";
import runningCharacter from "../../assets/images/running_character.svg";
import runningRing from "../../assets/images/running-recommendation-ring.svg";

const categories = ["수분", "빨래", "러닝"];

// 숫자 카드(강수/습도/체감온도/대기질)에 공통으로 쓰는 스타일
const statBoxProps = {
  className: "!h-[118px] !min-h-[118px] !rounded-[20px] !border-[#E9E8E8]/70",
  labelClassName: "!text-[16px] !text-[#6F6F6F]",
  valueClassName: "!text-[22px]",
};

const RunningSituationDetail = () => {
  const navigate = useNavigate();
  // GET /api/situations/running/ (로그인 없이도 가능)
  // 비로그인이면 홈에서 고른 지역의 regionCode 를 같이 보내기 (hooks/useSituation.js 참고)
  const { isLoggedIn, needsRegion } = useSituationLocation();
  const { data, error, isLoading, isError, refetch } = useRunningQuery();

  // 낮이 지난 저녁에는 서버가 내일 기준으로 내려줘서 "오늘/내일" 문구를 바꿔줌
  const dayLabel = getDayLabel(data?.targetDate);
  const overview = data?.overview;
  const uvIndex = data?.uvIndex;
  // 추천 시간대는 최대 2개(아침/저녁). 조건이 나쁘면 빈 배열이라서 안내 문구를 보여줌
  const timeText = (data?.recommendedTimes ?? [])
    .map(formatTimeRange)
    .filter(Boolean)
    .join(" | ");

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[1000px] w-full max-w-[390px] overflow-hidden bg-white pb-[120px] text-[#353331]">
        <div className="absolute left-[24px] right-[24px] top-[28px]">
          <Header />
        </div>

        <nav
          aria-label="상황 카테고리"
          className="absolute left-[28px] top-[85px] flex gap-[14px]"
        >
          {categories.map((category) => (
            <Chip
              key={category}
              active={category === "러닝"}
              onClick={() =>
                navigate(
                  category === "수분"
                    ? "/situation"
                    : category === "빨래"
                      ? "/situation/laundry"
                      : "/situation/running",
                )
              }
              className="!h-[37px] !px-[19px] !text-[14px] !tracking-[-0.42px]"
            >
              {category}
            </Chip>
          ))}
        </nav>

        <div
          className="absolute left-[62px] top-[122px] h-[263px] w-[263px]"
          aria-hidden="true"
        >
          <img
            src={runningRing}
            alt=""
            className="absolute inset-0 h-full w-full"
          />
          <img
            src={runningCharacter}
            alt=""
            className="absolute left-1/2 top-1/2 h-[149px] w-[120px] -translate-x-1/2 -translate-y-1/2 object-contain"
          />
        </div>

        {/* 글이 길어져도 내용이 겹치지 않도록, 아래 영역은 위에서부터 차례로 쌓이게(flow) 배치 */}
        <div className="mt-[362px]">
          <section className="w-full px-[20px] text-center">
            <h1 className="text-[16px] font-semibold leading-[1.5] tracking-[-0.4px]">
              {dayLabel} 러닝 추천 시간대
            </h1>
            <p className="mt-[8px] text-[18px] font-semibold leading-[1.5] tracking-[-0.45px] text-[#60E1FF]">
              {timeText || (data ? "추천 시간대 없음" : "-")}
            </p>
            <div className="mt-[3px] break-keep text-[16px] font-medium leading-[1.65] tracking-[-0.4px] text-[#62605F]">
              {isLoading && <p>러닝 정보를 불러오는 중이에요...</p>}
              {/* 비로그인인데 고른 지역이 없을 때: 홈에서 지역을 고르도록 안내 */}
              {needsRegion && (
                <>
                  <p>지역을 선택하면 러닝 정보를 알려드려요.</p>
                  <button
                    type="button"
                    onClick={() => navigate("/home")}
                    className="mt-[4px] font-semibold text-[#1BA9E1] underline"
                  >
                    홈에서 지역 선택하기
                  </button>
                </>
              )}
              {/* 서버 오류(위치 오류 포함): 서버가 준 문구를 보여주고 다시 시도/지역 선택 제공 */}
              {isError && !data && (
                <>
                  <p>
                    {getErrorMessage(error, "러닝 정보를 불러오지 못했어요.")}
                  </p>
                  <div className="mt-[4px] flex justify-center gap-[14px] font-semibold text-[#1BA9E1] underline">
                    <button type="button" onClick={() => refetch()}>
                      다시 시도
                    </button>
                    {!isLoggedIn && (
                      <button type="button" onClick={() => navigate("/home")}>
                        지역 다시 선택
                      </button>
                    )}
                  </div>
                </>
              )}
              {data && <p>{data.summary}</p>}
            </div>
          </section>

          <section
            className="ml-[39px] mt-[28px] w-[302px]"
            aria-labelledby="running-info-title"
          >
            <h2
              id="running-info-title"
              className="text-[24px] font-semibold leading-[1.4] tracking-[-0.6px]"
            >
              {dayLabel}의 러닝 정보
            </h2>
            <p className="mt-[8px] text-[16px] font-medium leading-[1.5] tracking-[-0.4px] text-[#62605F]">
              {dayLabel} 자외선 지수 |{" "}
              {uvIndex ? `${uvIndex.label}(${uvIndex.value})` : "-"}
            </p>
            <div className="mt-[18px] grid grid-cols-2 gap-[12px]">
              <StatBox
                label="강수"
                value={formatPercent(overview?.precipitationProbability)}
                {...statBoxProps}
              />
              <StatBox
                label="습도"
                value={formatPercent(overview?.humidity)}
                {...statBoxProps}
              />
              <StatBox
                label="체감온도"
                value={formatTemperature(overview?.feelsLike)}
                {...statBoxProps}
              />
              <StatBox
                label="대기질"
                value={overview?.airQuality?.label ?? "-"}
                {...statBoxProps}
              />
            </div>
          </section>
        </div>

        <BottomNav />
      </main>
    </MobileLayout>
  );
};

export default RunningSituationDetail;
