import BottomNav from "../../components/BottomNav";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Chip from "../../components/Chip";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import StatBox from "../../components/StatBox";
import {
  useLaundryQuery,
  useSituationLocation,
} from "../../hooks/useSituation";
import {
  formatPercent,
  formatTimeRange,
  getDayLabel,
  getErrorMessage,
} from "../../utils/situation";
import laundryCharacter from "../../assets/images/laundry_character.svg";

const categories = ["수분", "빨래", "러닝"];

// 숫자 카드(강수/습도/풍속)에 공통으로 쓰는 스타일
const statBoxProps = {
  className:
    "!h-[90px] !min-h-[90px] !rounded-[20px] !border-[#E9E8E8]/60 !px-2 !py-2",
  labelClassName: "!text-[14px] !leading-[1.5] !text-[#6F6F6F]",
  valueClassName: "!mt-0 !text-[18px] !leading-[1.38] !text-[#252525]",
};

const LaundrySituationDetail = () => {
  const navigate = useNavigate();
  // GET /api/situations/laundry/ (로그인 없이도 가능)
  // 비로그인이면 홈에서 고른 지역의 regionCode 를 같이 보내기 (hooks/useSituation.js 참고)
  const { isLoggedIn, needsRegion } = useSituationLocation();
  const { data, error, isLoading, isError, refetch } = useLaundryQuery();

  // 낮이 지난 저녁에는 서버가 내일 기준으로 내려줘서 "오늘/내일" 문구를 바꿔줌
  const dayLabel = getDayLabel(data?.targetDate);
  const overview = data?.overview;
  const timeRange = formatTimeRange(data?.recommendedTime);

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[1134px] w-full max-w-[390px] overflow-hidden bg-white text-[#353331]">
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
              active={category === "빨래"}
              onClick={() =>
                navigate(
                  category === "수분"
                    ? "/situation"
                    : category === "러닝"
                      ? "/situation/running"
                      : "/situation/laundry",
                )
              }
              className="!h-[37px] !px-[19px] !text-[14px] !tracking-[-0.42px]"
            >
              {category}
            </Chip>
          ))}
        </nav>

        <div
          className="absolute left-0 top-[128px] h-[238px] w-full overflow-hidden"
          aria-hidden="true"
        >
          <img
            src={laundryCharacter}
            alt=""
            className="absolute left-[-0.19%] top-[-10.5%] max-w-none w-[100.38%]"
          />
        </div>

        {/* 글이 길어져도 카드가 늘어나도록, 아래 영역은 위에서부터 차례로 쌓이게(flow) 배치 */}
        <div className="mt-[350px] px-[24px] pb-[128px]">
          <h1 className="px-[8px] text-[24px] font-semibold leading-[1.4] tracking-[-0.6px]">
            {dayLabel}의 빨래 정보
          </h1>

          <Card className="relative mt-[24px] min-h-[243px] w-full !rounded-[20px] !border-[#D2D2D1]/60 !px-[29px] !pb-[22px] !pt-[19px]">
            <h2 className="text-[16px] font-semibold leading-[1.38] tracking-[-0.48px]">
              {dayLabel}의 빨래 점수
            </h2>
            <p className="mt-[8px] text-[36px] font-semibold leading-[1.3] text-[#60E1FF]">
              {data ? `${data.score}점` : "-"}
            </p>
            <div className="mt-[3px] break-keep text-[15px] font-medium leading-[1.75] tracking-[-0.45px] text-[#62605F]">
              {isLoading && <p>빨래 정보를 불러오는 중이에요...</p>}
              {/* 비로그인인데 고른 지역이 없을 때: 홈에서 지역을 고르도록 안내 */}
              {needsRegion && (
                <>
                  <p>지역을 선택하면 빨래 정보를 알려드려요.</p>
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
                    {getErrorMessage(error, "빨래 정보를 불러오지 못했어요.")}
                  </p>
                  <div className="mt-[4px] flex gap-[14px] font-semibold text-[#1BA9E1] underline">
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
          </Card>

          <div className="mt-[24px] grid w-full grid-cols-3 gap-3">
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
              label="풍속"
              value={overview?.windLabel ?? "-"}
              {...statBoxProps}
            />
          </div>

          <h2 className="mt-[25px] px-[8px] text-[18px] font-semibold leading-[1.5] tracking-[-0.54px]">
            빨래하기 좋은 시간대를 알려드려요
          </h2>
          <Card className="relative mt-[23px] min-h-[167px] w-full !rounded-[20px] !border-[#D2D2D1]/60 !px-[22px] !pb-[20px] !pt-[13px]">
            {/* 추천 시간대가 없으면(recommendedTime 이 null) 안내 문구만 보여줌 */}
            <p className="text-[32px] font-semibold leading-[1.4] tracking-[-0.6px] text-[#60E1FF]">
              {timeRange || (data ? "추천 시간대 없음" : "-")}
            </p>
            <p className="mt-[3px] break-keep text-[15px] font-medium leading-[1.75] tracking-[-0.4px] text-[#8F8E8D]">
              {data?.recommendedMessage ?? ""}
            </p>
          </Card>
        </div>

        <BottomNav />
      </main>
    </MobileLayout>
  );
};

export default LaundrySituationDetail;
