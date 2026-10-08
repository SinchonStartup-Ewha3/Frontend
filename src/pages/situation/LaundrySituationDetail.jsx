import BottomNav from "../../components/BottomNav";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Chip from "../../components/Chip";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import StatBox from "../../components/StatBox";
import laundryCharacter from "../../assets/images/laundry_character.svg";

const categories = ["수분", "빨래", "러닝"];

export default function LaundrySituationDetail() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[1134px] w-full max-w-[390px] overflow-hidden bg-white text-[#353331]">
        <div className="absolute left-[24px] right-[24px] top-[28px]">
          <Header />
        </div>

        <nav aria-label="상황 카테고리" className="absolute left-[28px] top-[85px] flex gap-[14px]">
          {categories.map((category) => (
            <Chip
              key={category}
              active={category === "빨래"}
              onClick={() => navigate(category === "수분" ? "/situation" : category === "러닝" ? "/situation/running" : "/situation/laundry")}
              className="!h-[37px] !px-[19px] !text-[14px] !tracking-[-0.42px]"
            >
              {category}
            </Chip>
          ))}
        </nav>

        <div className="absolute left-0 top-[128px] h-[238px] w-full overflow-hidden" aria-hidden="true">
          <img
            src={laundryCharacter}
            alt=""
            className="absolute left-[-0.19%] top-[-10.5%] max-w-none w-[100.38%]"
          />
        </div>

        <h1 className="absolute left-[32px] top-[350px] text-[24px] font-semibold leading-[1.4] tracking-[-0.6px]">
          오늘의 빨래 정보
        </h1>

        <Card className="absolute left-1/2 top-[408px] h-[243px] w-[calc(100%-48px)] -translate-x-1/2 !rounded-[20px] !border-[#D2D2D1]/60 !p-0">
          <h2 className="absolute left-[29px] top-[19px] text-[16px] font-semibold leading-[1.38] tracking-[-0.48px]">
            오늘의 빨래 점수
          </h2>
          <p className="absolute left-[29px] top-[49px] text-[36px] font-semibold leading-[1.3] text-[#60E1FF]">
            90점
          </p>
          <div className="absolute left-[29px] right-[22px] top-[99px] text-[15px] font-medium leading-[1.75] tracking-[-0.45px] text-[#62605F]">
            <p>오늘은 강수 10%, 습도 30%, 풍속 보통으로</p>
            <p>날씨가 예상됩니다. 비가 오지 않고 습도도 높지</p>
            <p>빨래를 하기에 적합한 날씨입니다.</p>
            <p>다만, 오후에 날이 살짝 흐려지면서 일조량이</p>
          </div>
        </Card>

        <div className="absolute left-1/2 top-[675px] grid w-[calc(100%-48px)] -translate-x-1/2 grid-cols-3 gap-3">
          <StatBox
            label="강수"
            value="10%"
            className="!h-[90px] !min-h-[90px] !rounded-[20px] !border-[#E9E8E8]/60 !px-2 !py-2"
            labelClassName="!text-[14px] !leading-[1.5] !text-[#6F6F6F]"
            valueClassName="!mt-0 !text-[18px] !leading-[1.38] !text-[#252525]"
          />
          <StatBox
            label="습도"
            value="30%"
            className="!h-[90px] !min-h-[90px] !rounded-[20px] !border-[#E9E8E8]/60 !px-2 !py-2"
            labelClassName="!text-[14px] !leading-[1.5] !text-[#6F6F6F]"
            valueClassName="!mt-0 !text-[18px] !leading-[1.38] !text-[#252525]"
          />
          <StatBox
            label="풍속"
            value="보통"
            className="!h-[90px] !min-h-[90px] !rounded-[20px] !border-[#E9E8E8]/60 !px-2 !py-2"
            labelClassName="!text-[14px] !leading-[1.5] !text-[#6F6F6F]"
            valueClassName="!mt-0 !text-[18px] !leading-[1.38] !text-[#252525]"
          />
        </div>

        <h2 className="absolute left-[32px] top-[790px] text-[18px] font-semibold leading-[1.5] tracking-[-0.54px]">
          빨래하기 좋은 시간대를 알려드려요
        </h2>
        <Card className="absolute left-1/2 top-[840px] h-[167px] w-[calc(100%-48px)] -translate-x-1/2 !rounded-[20px] !border-[#D2D2D1]/60 !p-0">
          <p className="absolute left-[23px] top-[13px] text-[32px] font-semibold leading-[1.4] tracking-[-0.6px] text-[#60E1FF]">
            11:30 - 14:00
          </p>
          <div className="absolute left-[22px] right-[22px] top-[61px] text-[15px] font-medium leading-[1.75] tracking-[-0.4px] text-[#8F8E8D]">
            <p>오늘의 날씨를 고려했을 때 빨래가 마르는 데에 약</p>
            <p>시간이 소요될 것이라 생각됩니다. 일조량이 줄어</p>
            <p>드는 시간을 고려하여</p>
          </div>
        </Card>

        <BottomNav />
      </main>
    </MobileLayout>
  );
}
