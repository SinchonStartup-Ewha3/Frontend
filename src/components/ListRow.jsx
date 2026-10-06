// 행의 종류에 따라 글자와 화살표 색을 정합니다.
const VARIANTS = {
  default: "text-[#353331]", // 기본 색
  danger: "text-[#F35C4B]",   // 취소·삭제처럼 주의가 필요한 항목
  accent: "text-[#60E1FF]",   // 강조할 항목
};

export default function ListRow({
  children,                  // 행 안에 표시할 글자
  onClick,                    // 행을 눌렀을 때 실행할 함수
  variant = "default",        // 색상 종류. 생략하면 기본 색
  className = "",             // 필요하면 추가할 Tailwind 클래스
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      // 글자와 오른쪽 화살표를 양 끝에 배치하고, 행 높이를 최소 32px로 설정.
      className={`flex min-h-8 w-full items-center justify-between text-left text-sm ${
        VARIANTS[variant] ?? VARIANTS.default
      } ${className}`}
    >
      <span>{children}</span>

      {/* 오른쪽 방향 화살표입니다. 장식용이므로 스크린 리더에서는 숨깁니다. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="h-[18px] w-[18px] shrink-0"
      >
        <path
          d="m9 18 6-6-6-6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}