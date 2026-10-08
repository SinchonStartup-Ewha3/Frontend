import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import Chip from "../../components/Chip";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import StatBox from "../../components/StatBox";
import runningCharacter from "../../assets/images/running_character.svg";
import runningRing from "../../assets/images/running-recommendation-ring.svg";

const categories = ["수분", "빨래", "러닝"];

export default function RunningSituationDetail() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[1000px] w-full max-w-[390px] overflow-hidden bg-white pb-[120px] text-[#353331]">
        <div className="absolute left-[24px] right-[24px] top-[28px]">
          <Header />
        </div>

        <nav aria-label="상황 카테고리" className="absolute left-[28px] top-[85px] flex gap-[14px]">
          {categories.map((category) => (
            <Chip
              key={category}
              active={category === "러닝"}
              onClick={() => navigate(category === "수분" ? "/situation" : category === "빨래" ? "/situation/laundry" : "/situation/running")}
              className="!h-[37px] !px-[19px] !text-[14px] !tracking-[-0.42px]"
            >
              {category}
            </Chip>
          ))}
        </nav>

        <div className="absolute left-[62px] top-[122px] h-[263px] w-[263px]" aria-hidden="true">
          <img src={runningRing} alt="" className="absolute inset-0 h-full w-full" />
          <img src={runningCharacter} alt="" className="absolute left-1/2 top-1/2 h-[149px] w-[120px] -translate-x-1/2 -translate-y-1/2 object-contain" />
        </div>

        <section className="absolute left-0 top-[362px] w-full px-[20px] text-center">
          <h1 className="text-[16px] font-semibold leading-[1.5] tracking-[-0.4px]">오늘 러닝 추천 시간대</h1>
          <p className="mt-[8px] text-[18px] font-semibold leading-[1.5] tracking-[-0.45px] text-[#60E1FF]">
            10:00 - 12:30 | 17:30 - 20:30
          </p>
          <p className="mt-[3px] text-[16px] font-medium leading-[1.65] tracking-[-0.4px] text-[#62605F]">
            오늘은 비가 오지 않고 체감온도와 습도 모두 적당해<br />
            러닝하기에 최적의 날씨입니다.
          </p>
        </section>

        <section className="absolute left-[39px] top-[505px] w-[302px]" aria-labelledby="running-info-title">
          <h2 id="running-info-title" className="text-[24px] font-semibold leading-[1.4] tracking-[-0.6px]">
            오늘의 러닝 정보
          </h2>
          <p className="mt-[8px] text-[16px] font-medium leading-[1.5] tracking-[-0.4px] text-[#62605F]">
            오늘 자외선 지수 | **
          </p>
          <div className="mt-[18px] grid grid-cols-2 gap-[12px]">
            <StatBox label="강수" value="10%" className="!h-[118px] !min-h-[118px] !rounded-[20px] !border-[#E9E8E8]/70" labelClassName="!text-[16px] !text-[#6F6F6F]" valueClassName="!text-[22px]" />
            <StatBox label="습도" value="30%" className="!h-[118px] !min-h-[118px] !rounded-[20px] !border-[#E9E8E8]/70" labelClassName="!text-[16px] !text-[#6F6F6F]" valueClassName="!text-[22px]" />
            <StatBox label="체감온도" value="24°" className="!h-[118px] !min-h-[118px] !rounded-[20px] !border-[#E9E8E8]/70" labelClassName="!text-[16px] !text-[#6F6F6F]" valueClassName="!text-[22px]" />
            <StatBox label="대기질" value="보통" className="!h-[118px] !min-h-[118px] !rounded-[20px] !border-[#E9E8E8]/70" labelClassName="!text-[16px] !text-[#6F6F6F]" valueClassName="!text-[22px]" />
          </div>
        </section>

        <BottomNav />
      </main>
    </MobileLayout>
  );
}
