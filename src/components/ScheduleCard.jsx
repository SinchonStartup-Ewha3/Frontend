import { useState } from "react";
import moreIcon from "../assets/icons/more-vertical.svg";
import { formatDays, formatTimeKo } from "../utils/format";

// 알림 일정 카드 (알림 상세 > 내 알림 일정). 오른쪽 ⋮ 를 누르면 "삭제" 메뉴가 열려요.
//  - 수정 기능은 GUI에 없어서 삭제만 제공. 필요하면 메뉴에 항목 추가.
const ScheduleCard = ({ schedule, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="relative h-[113px] rounded-[13px] border border-[#D2D2D1] bg-white px-6 pt-[23px]">
      <h3 className="text-sm font-semibold leading-5 tracking-[-0.02em] text-[#4C4A48]">{schedule.name}</h3>
      <p className="mt-[5px] text-sm font-medium leading-5 tracking-[-0.02em] text-[#A5A4A3]">
        {formatDays(schedule.days)} {formatTimeKo(schedule.time)}
      </p>
      <p className="text-xs font-medium leading-5 tracking-[-0.02em] text-[#A5A4A3]">{schedule.region}</p>

      <button
        type="button"
        aria-label="일정 메뉴"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
        className="absolute right-[10px] top-[18px] flex h-8 w-8 items-center justify-center"
      >
        <img src={moreIcon} alt="" className="h-[14px]" />
      </button>

      {menuOpen && (
        <>
          {/* 바깥을 누르면 메뉴 닫기 */}
          <button type="button" aria-label="메뉴 닫기" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-[10px] top-[46px] z-20 overflow-hidden rounded-[10px] border border-[#E9E8E8] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onDelete?.(schedule);
              }}
              className="block h-10 w-24 text-sm font-medium text-[#F35C4B]"
            >
              삭제
            </button>
          </div>
        </>
      )}
    </article>
  );
};

export default ScheduleCard;
