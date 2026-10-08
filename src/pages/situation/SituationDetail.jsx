import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import BottomSheet from "../../components/BottomSheet";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Chip from "../../components/Chip";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import raindropCharacter from "../../assets/images/raindrop_character.svg";
import skincareCharacter from "../../assets/images/skincare_character.svg";
import waterWaveBack from "../../assets/images/water-record-wave-back.svg";
import waterWaveFront from "../../assets/images/water-record-wave-front.svg";

const categories = ["수분", "빨래", "러닝"];
const initialHourlyRecords = [60, 50, 35, 45, 30, 0, 0, 0, 0, 60, 50, 35, 45, 30, 0, 0, 0, 70, 45, 25, 20, 0, 0, 0];

const formatTime = (date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
const normalizeRecordAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 100;
  return Math.min(300, Math.max(100, Math.round(amount / 10) * 10));
};

export default function SituationDetail() {
  const navigate = useNavigate();
  const [waterAmount, setWaterAmount] = useState(600);
  const [isEditing, setIsEditing] = useState(false);
  const [recordAmountInput, setRecordAmountInput] = useState("180");
  const [recordTime, setRecordTime] = useState(() => formatTime(new Date()));
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()));
  const [hourlyRecords, setHourlyRecords] = useState(initialHourlyRecords);
  const [addedRecords, setAddedRecords] = useState([]);
  const progress = Math.min(100, Math.round((waterAmount / 1500) * 100));
  const currentHour = Number(recordTime.slice(0, 2));
  const currentHourIndex = (currentHour + 23) % 24;
  const recordAmount = normalizeRecordAmount(recordAmountInput);

  useEffect(() => {
    const updateTime = () => setCurrentTime(formatTime(new Date()));
    const interval = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const changeRecordTime = (halfHourDelta) => {
    const [hour, minute] = recordTime.split(":").map(Number);
    const nextMinutes = (hour * 60 + minute + halfHourDelta * 30 + 1440) % 1440;
    setRecordTime(`${String(Math.floor(nextMinutes / 60)).padStart(2, "0")}:${String(nextMinutes % 60).padStart(2, "0")}`);
  };

  const addRecord = () => {
    setRecordAmountInput(String(recordAmount));
    setWaterAmount((current) => current + recordAmount);
    setHourlyRecords((current) => current.map((amount, index) => (
      index === currentHourIndex ? amount + recordAmount : amount
    )));
    setAddedRecords((current) => [...current, { hourIndex: currentHourIndex, amount: recordAmount }]);
  };

  const cancelLastRecord = () => {
    const lastRecord = addedRecords.at(-1);
    if (!lastRecord) return;

    setWaterAmount((current) => Math.max(0, current - lastRecord.amount));
    setHourlyRecords((current) => current.map((amount, index) => (
      index === lastRecord.hourIndex ? Math.max(0, amount - lastRecord.amount) : amount
    )));
    setAddedRecords((current) => current.slice(0, -1));
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[1060px] w-full max-w-[390px] overflow-hidden bg-white text-[#353331]">
        <div className="absolute left-[24px] right-[24px] top-[28px]">
          <Header />
        </div>
        <nav aria-label="상황 카테고리" className="absolute left-[28px] top-[85px] flex gap-[14px]">
          {categories.map((category) => {
            const selected = category === "수분";
            return (
              <Chip
                key={category}
                active={selected}
                onClick={() => navigate(category === "빨래" ? "/situation/laundry" : category === "러닝" ? "/situation/running" : "/situation")}
                className="!h-[37px] !px-[19px] !text-[14px] !tracking-[-0.42px]"
              >
                {category}
              </Chip>
            );
          })}
        </nav>

        <h1 className="absolute left-[28px] top-[145px] text-[24px] font-semibold leading-[1.3] tracking-[-0.6px]">오늘의 수분 충전</h1>

        <div className="absolute left-1/2 top-[208px] h-[192px] w-[156px] -translate-x-1/2" aria-label={`권장량의 ${progress}%를 섭취했어요`} role="img">
          <img src={raindropCharacter} alt="" className="absolute inset-0 h-full w-full object-contain" />
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label={`현재 섭취량 ${waterAmount}밀리리터, 섭취량 수정`}
          className="absolute left-1/2 top-[421px] flex h-[39px] -translate-x-1/2 items-center justify-center gap-[5px] rounded-full bg-gradient-to-r from-[#60E1FF] to-[#B1F0FE] px-[19px] text-[24px] font-semibold leading-none tracking-[-0.72px] text-white"
        >
          {progress}%
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <path d="m8.8 2.1 2.1 2.1M2 11l2.5-.5 6.2-6.2a1.5 1.5 0 0 0-2.1-2.1l-6.2 6.2L2 11Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <Card className="absolute left-1/2 top-[477px] h-[205px] w-[calc(100%-48px)] -translate-x-1/2 !rounded-[20px] !border-2 !p-0">
          <div role="group" aria-label="수분 섭취 현황" className="px-[23px] pt-[21px]">
          <p className="text-[20px] font-semibold leading-[1.55] tracking-[-0.5px]">권장 섭취량 | 1.5L</p>
          <p className="text-[20px] font-semibold leading-[1.55] tracking-[-0.5px]">현재 섭취량 | {waterAmount}mL</p>
          <div className="mt-[12px] text-[15px] font-medium leading-[1.75] tracking-[-0.4px] text-[#62605F]">
            <p>오늘의 습도는 20%로, 매우 건조한 날씨예요.</p>
            <p>건조한 날에는 몸에서 수분이 더 쉽게 빠져 나가기</p>
            <p>때문에 수분 섭취에 더 세심한 주의가 필요해요.</p>
          </div>
          </div>
        </Card>

        <h2 className="absolute left-[28px] top-[713px] text-[20px] font-semibold leading-[1.4] tracking-[-0.5px]">피부에도 수분 충전이 필요해요</h2>
        <Card className="absolute left-1/2 top-[756px] h-[196px] w-[calc(100%-48px)] -translate-x-1/2 !overflow-hidden !rounded-[20px] !border-2 !border-[#E9E8E8]/70 !p-0">
          <div role="group" aria-label="피부 수분 관리 팁" className="px-[22px] pt-[13px]">
          <div className="w-[303px] max-w-full text-[16px] font-medium leading-[1.75] tracking-[-0.4px] text-[#62605F]">
            <p>오늘의 습도는 20%로, 매우 건조한 날씨예요.</p>
            <p>두꺼운 수분 크림을 바르거나, 펩타이드 등의 성분이 함유된 기초 제품을 선택해보세요.</p>
          </div>
          <img src={skincareCharacter} alt="수분 크림을 든 스킨케어 캐릭터" className="absolute bottom-0 right-[-1px] h-[106px] w-[112px] object-contain" />
          </div>
        </Card>

        <BottomNav />
        <BottomSheet
          isOpen={isEditing}
          title="수분 섭취량을 기록해주세요"
          onClose={() => setIsEditing(false)}
          showHandle={false}
          showClose={false}
          backdropClassName="bg-[#D2D2D1]/60"
          titleClassName="!text-[26px] !tracking-[-0.78px]"
        >
          <div className="mt-2">
            <Card className="relative mx-auto h-[205px] w-full max-w-[319px] !overflow-hidden !rounded-[16px] !border-[0.5px] !border-[#BCBBBA] !p-0 shadow-[0px_4px_45px_0px_rgba(27,169,225,0.08)]">
              <img src={waterWaveBack} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-[-149px] left-[-265px]" />
              <img src={waterWaveFront} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-[-111px] left-[-116px]" />
              <div className="absolute left-[19px] top-[9px] z-10">
                <p className="text-[20px] font-medium leading-8 text-[#1F1C1A]">{currentTime}</p>
                <p className="text-[14px] font-medium leading-5 tracking-[-0.14px] text-[#8F8E8D]">누적 {waterAmount}ml</p>
              </div>

              <div className="absolute left-[16px] right-[16px] top-[70px] z-10 flex items-center justify-between gap-2">
                <div className="flex h-[30px] min-w-0 items-center rounded-full border border-[#D2D2D1] bg-white/90 px-2">
                  <button type="button" aria-label="기록 시간 30분 줄이기" onClick={() => changeRecordTime(-1)} className="w-5 text-[15px] text-[#353331]">−</button>
                  <span className="mx-1 whitespace-nowrap text-[11px] font-medium tabular-nums">{recordTime}</span>
                  <button type="button" aria-label="기록 시간 30분 늘리기" onClick={() => changeRecordTime(1)} className="w-5 text-[15px] text-[#353331]">+</button>
                </div>
                <div className="flex h-[30px] min-w-0 items-center rounded-full border border-[#D2D2D1] bg-white/90 px-2">
                  <button type="button" aria-label="기록량 10밀리리터 줄이기" onClick={() => setRecordAmountInput(String(Math.max(100, recordAmount - 10)))} className="w-5 text-[15px] text-[#353331]">−</button>
                  <input
                    type="number"
                    min="100"
                    max="300"
                    step="10"
                    value={recordAmountInput}
                    aria-label="수분 섭취량, 100에서 300밀리리터"
                    onChange={(event) => setRecordAmountInput(event.target.value)}
                    onBlur={() => setRecordAmountInput(String(recordAmount))}
                    className="mx-1 w-[52px] appearance-none bg-transparent text-center text-[11px] font-medium tabular-nums text-[#353331] outline-none"
                  />
                  <span className="-ml-1 text-[11px] font-medium">mL</span>
                  <button type="button" aria-label="기록량 10밀리리터 늘리기" onClick={() => setRecordAmountInput(String(Math.min(300, recordAmount + 10)))} className="w-5 text-[15px] text-[#353331]">+</button>
                </div>
              </div>

              <div className="absolute bottom-[20px] right-[16px] z-10 flex items-center gap-2">
                {addedRecords.length > 0 && (
                  <button type="button" onClick={cancelLastRecord} aria-label="가장 최근에 추가한 수분 기록 취소" className="rounded-full bg-white px-[12px] py-[5px] text-[12px] font-medium leading-4 text-[#62605F] shadow-[0_4px_16px_rgba(49,144,232,0.18)]">
                    추가 취소
                  </button>
                )}
                <button type="button" onClick={addRecord} className="rounded-full bg-white px-[16px] py-[5px] text-[12px] font-medium leading-4 text-[#1F1C1A] shadow-[0_4px_16px_rgba(49,144,232,0.18)]">
                  추가하기
                </button>
              </div>
            </Card>

            <Card className="mx-auto mt-[21px] h-[168px] w-full max-w-[319px] !rounded-[18px] !border-[0.5px] !border-[#D0D0D0] !p-0">
              <h3 className="ml-[22px] mt-[18px] text-[18px] font-medium leading-6 text-[#1F1C1A]">시간별 기록</h3>
              <div className="mx-[22px] mt-[12px] flex h-[82px] items-end justify-between border-b border-[#C7CED0]" role="img" aria-label="하루 시간대별 수분 섭취 기록">
                {hourlyRecords.map((amount, index) => {
                  const barHeight = amount ? Math.max(3, Math.round((Math.min(amount, 800) / 800) * 76)) : 0;
                  return (
                    <div key={index} className="relative h-full w-[5px] shrink-0 rounded-t-[8px] bg-[#D4F3FA]/50">
                      {amount > 0 && <div className="absolute inset-x-0 bottom-0 rounded-t-[8px] bg-[#60E1FF]" style={{ height: `${barHeight}px` }} />}
                    </div>
                  );
                })}
              </div>
              <div className="mx-[21px] mt-[4px] flex justify-between text-[8px] font-light leading-none text-[#353331]">
                {Array.from({ length: 24 }, (_, index) => <span key={index}>{index + 1}</span>)}
              </div>
            </Card>

            <Button onClick={() => setIsEditing(false)} className="mt-[24px] h-[44px] !rounded-[10px] text-[16px]">
              완료
            </Button>
          </div>
        </BottomSheet>
      </main>
    </MobileLayout>
  );
}
