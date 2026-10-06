// 일반적인 버튼 컴포넌트 입니당!!
const BASE =
  "w-full flex items-center justify-center gap-1.5 rounded-[0.625rem] text-lg font-semibold leading-normal tracking-[-0.01125rem] disabled:cursor-not-allowed";

// variant 값에 따라 달라지는 스타일 정리
const STYLES = {
  // 다음, 저장 등 기본 CTA (하늘색 배경 + 흰 글자) // 이거 disabled 어떻게 할 건지..
  primary: "h-[2.75rem] bg-main text-white disabled:opacity-40",

  // 현재 위치로 찾기 (연한 하늘색 배경 + 하늘색 글자)
  soft: "h-[2.75rem] bg-sub text-main disabled:opacity-40",

  // 회원 탈퇴 (회색 배경 + 회색 글자)
  ghost: "h-[2.75rem] bg-[#E9E8E8] text-[#BCBBBA]",

  // 오늘의 운세 보기 (흰 배경 + 진한 글자)
  white: "h-[2.75rem] bg-white text-[#797776]",

  // 카카오톡으로 시작하기 (카카오 노란색)
  kakao: "h-[2.75rem] bg-[#FBE300] text-[#797776]",
};

// 설문 선택지(variant="option")의 선택 여부별 스타일 정리...~
// on: 선택됨 - 연한 하늘색 배경 + 하늘색 테두리/글자
// off: 선택 안 됨 - 흰 배경 + 회색 테두리/글자
const OPTION_STYLES = {
  on: "bg-[#E5FAFF] border-main text-main",
  off: "bg-white border-[#E9E8E8] text-[#D2D2D1]",
};

const Button = ({
  children,
  variant = "primary",
  selected = false,
  icon,
  className = "",
  ...props
}) => {
  const style =
    variant === "option"
      ? `h-[3.25rem] border ${selected ? OPTION_STYLES.on : OPTION_STYLES.off}`
      : STYLES[variant];

  return (
    <button
      type="button"
      aria-pressed={variant === "option" ? selected : undefined}
      className={`${BASE} ${style} ${className}`}
      {...props}
    >
      {/* icon이 있을 때만 이미지 표시하도록!!..~ */}
      {icon && <img src={icon} alt="" className="w-4 h-4" />}
      {children}
    </button>
  );
};

export default Button;
