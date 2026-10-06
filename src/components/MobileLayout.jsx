// PC 기준 모바일 화면 규격 외의 배경색은 임의로 정했습니당..~ 엷은 회색...?
// 약간 shadow도 들어가도 괜찮을 거 같아서 일단 넣어봤어요..~
const MobileLayout = ({ children }) => (
  <div className="min-h-screen flex justify-center bg-[#f4f4f4]">
    <div className="relative w-full max-w-[390px] min-h-screen bg-white shadow-sm overflow-x-hidden">
      {children}
    </div>
  </div>
);

export default MobileLayout;
