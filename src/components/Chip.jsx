// 태그, 카테고리 같은 형태의 pill...
const Chip = ({ children, active, onClick, disabled = false, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`px-3 h-[2.25rem] rounded-full font-sans text-sm font-semibold leading-normal tracking-[-0.02625rem] border ${
      active
        ? "bg-main text-white border-main"
        : "bg-white text-[#A5A4A3] border-[#A5A4A3]"
      } ${className}`}
  >
    {children}
  </button>
);

export default Chip;
