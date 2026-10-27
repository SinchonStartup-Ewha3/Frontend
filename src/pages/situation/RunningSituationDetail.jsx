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
import weeLogo from "../../assets/icons/logo.svg";

const categories = ["수분", "빨래", "러닝"];

// 숫자 카드(강수/습도/체감온도/대기질)에 공통으로 쓰는 스타일
const statBoxProps = {
  className: "!h-[118px] !min-h-[118px] !rounded-[20px] !border-[#E9E8E8]/70",
  labelClassName: "!text-[16px] !text-[#6F6F6F]",
  valueClassName: "!text-[22px]",
};

// 러닝 추천 시간대를 시계처럼 보여주는 원형 링
// - 12시간 시계판이에요: 12시가 맨 위, 시계방향으로 3시/6시/9시 (오전·오후 모두 같은 판에 표시)
// - 추천 시간대(최대 2개)마다 호를 하나씩 그려요. 예) 10:00 - 12:30 -> 시계 10시 ~ 12시 반 자리
// - 오전 시간대는 하늘색, 오후 시간대는 보라색 계열 (기존 링 svg 의 색)
const RING_CENTER = 131.34;
const RING_RADIUS = 86.45;
const RING_WIDTH = 15.03;
// 호 양끝이 둥글어서 양쪽으로 튀어나오는 만큼(각도)을 빼서, 시간 범위에 정확히 맞춤
const CAP_DEGREE = (RING_WIDTH / 2 / RING_RADIUS) * (180 / Math.PI);

// "10:30" -> 630 (하루 중 몇 분째인지). 형식이 이상하면 null
const toMinutes = (hhmm) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm ?? "");
  if (!match) return null;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return minutes <= 24 * 60 ? minutes : null;
};

// 각도(12시 방향 0도, 시계방향) -> 링 위의 좌표
const pointOnRing = (degree) => {
  const radian = (degree * Math.PI) / 180;
  return {
    x: RING_CENTER + RING_RADIUS * Math.sin(radian),
    y: RING_CENTER - RING_RADIUS * Math.cos(radian),
  };
};

// { start: "10:00", end: "12:30" } -> 링에 그릴 호 정보 (그릴 수 없으면 null)
const buildArc = (range) => {
  const startMinutes = toMinutes(range?.start);
  const endMinutes = toMinutes(range?.end);
  if (startMinutes === null || endMinutes === null) return null;
  // 12시간판이라 12시간(720분)마다 한 바퀴. 하루가 넘어가면(끝이 더 작으면) 24시간을 더해 계산
  const span =
    (endMinutes >= startMinutes
      ? endMinutes - startMinutes
      : endMinutes + 1440 - startMinutes) % 720 || 720;
  const startDegree = ((startMinutes % 720) / 720) * 360;
  const spanDegree = Math.min(359.9, (span / 720) * 360);
  // 둥근 끝 때문에 늘어난 만큼 양쪽에서 줄임 (너무 짧으면 가운데 점 하나로)
  const visibleDegree = Math.max(0.1, spanDegree - CAP_DEGREE * 2);
  const from = startDegree + (spanDegree - visibleDegree) / 2;
  const start = pointOnRing(from);
  const end = pointOnRing(from + visibleDegree);
  return {
    // 오전(정오 전에 시작)은 하늘색, 오후는 보라색
    isMorning: startMinutes < 720,
    start,
    end,
    // SVG 호 그리기: M 시작점 A 반지름 반지름 0 큰호여부 1(시계방향) 끝점
    path: `M ${start.x} ${start.y} A ${RING_RADIUS} ${RING_RADIUS} 0 ${visibleDegree > 180 ? 1 : 0} 1 ${end.x} ${end.y}`,
  };
};

const TimeRing = ({ times }) => {
  const arcs = (times ?? []).map(buildArc).filter(Boolean);
  return (
    <svg
      width="263"
      height="263"
      viewBox="0 0 263.001 263.001"
      fill="none"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        {/* 호마다 시작점 -> 끝점 방향으로 색이 변해요 (오전: 진한 하늘색 -> 연한 하늘색, 오후: 보라 -> 하늘색) */}
        {arcs.map((arc, index) => (
          <linearGradient
            key={index}
            id={`running-ring-gradient-${index}`}
            gradientUnits="userSpaceOnUse"
            x1={arc.start.x}
            y1={arc.start.y}
            x2={arc.end.x}
            y2={arc.end.y}
          >
            <stop stopColor={arc.isMorning ? "#60E1FF" : "#BF65FF"} />
            <stop
              offset="1"
              stopColor={arc.isMorning ? "#D4F3FA" : "#4BC4DF"}
            />
          </linearGradient>
        ))}
      </defs>
      {/* 바탕이 되는 연한 링 */}
      <circle
        cx={RING_CENTER}
        cy={RING_CENTER}
        r={RING_RADIUS}
        stroke="#E5FAFF"
        strokeWidth={RING_WIDTH}
      />
      {/* 추천 시간대 호 (추천 시간대가 없으면 바탕 링만 보여요) */}
      {arcs.map((arc, index) => (
        <path
          key={index}
          d={arc.path}
          stroke={`url(#running-ring-gradient-${index})`}
          strokeWidth={RING_WIDTH}
          strokeLinecap="round"
          opacity="0.85"
        />
      ))}
    </svg>
  );
};

const RunningSituationDetail = () => {
  const navigate = useNavigate();
  // GET /api/situations/running/ (로그인 없이도 가능)
  // 비로그인이면 홈에서 고른 지역의 regionCode 를 같이 보내요 (hooks/useSituation.js 참고)
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
        <img
          src={weeLogo}
          alt="WEE"
          className="absolute left-6 top-[28px] h-[24px] w-auto"
          style={{ filter: "brightness(0) saturate(100%) invert(80%) sepia(28%) saturate(1492%) hue-rotate(154deg) brightness(101%) contrast(101%)" }}
        />
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
          role="img"
          aria-label={
            data ? `러닝 추천 시간대 ${timeText || "없음"}` : "러닝 추천 시간대"
          }
        >
          <TimeRing times={data?.recommendedTimes} />
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
                value={formatTemperature(overview?.feelsLike ?? overview?.feels_like)}
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
