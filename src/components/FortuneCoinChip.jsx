import coinIcon from "../assets/icons/fortune-coin.svg";

// 남은 운세 코인 표시 (이용권이 없으면 아무것도 그리지 않아요)
export default function FortuneCoinChip({ coins, className = "" }) {
  if (!coins || coins.remaining == null) return null;
  const remaining = Number(coins.remaining);
  const total = coins.total != null ? Number(coins.total) : null;
  if (remaining === 0 && !total) return null; // 이용권 이력이 없으면 표시하지 않아요
  return (
    <div
      role="status"
      aria-label={`남은 운세 코인 ${remaining}개`}
      className={`inline-flex items-center gap-[6px] rounded-full border border-[#E9E8E8] bg-white/80 px-3 py-[5px] text-[13px] font-medium leading-[1.4] tracking-[-0.39px] text-[#62605F] ${className}`}
    >
      <img src={coinIcon} alt="" className="h-[18px] w-[18px]" />
      <span>
        남은 코인 <b className="font-semibold text-[#353331]">{remaining}</b>
        {total != null && <span className="text-[#A5A4A3]"> / {total}</span>}
      </span>
    </div>
  );
}
