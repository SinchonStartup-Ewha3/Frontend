export default function StatBox({
  label,
  value,
  className = "",
  labelClassName = "",
  valueClassName = "",
}) {
  return (
    <div className={`flex min-h-[118px] flex-col items-center justify-center rounded-[26px] border border-[#DDDDDD]/60 bg-white px-3 py-4 text-center ${className}`}>
      <span className={`text-[18px] font-medium leading-[1.5] text-[#797776] ${labelClassName}`}>
        {label}
      </span>

      <span className={`mt-1 text-[24px] font-semibold leading-[1.38] text-[#1F1C1A] ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

// ex) label: 강수, value:10%
