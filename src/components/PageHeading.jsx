// 페이지 큰 제목 + (선택) 회색 설명.
//  - size: "md"( 결제관리·게시물) | "lg"( 알림설정·설문)
const SIZE = {
  md: "text-[22px] leading-[1.38]",
  lg: "text-[24px] leading-[1.4]",
};

const PageHeading = ({
  title,
  description,
  size = "md",
  titleClassName = "",
  descClassName = "",
  className = "",
  style,
}) => (
  <div className={className} style={style}>
    <h1
      className={`whitespace-pre-line font-semibold tracking-[-0.02em] text-[#353331] ${SIZE[size]} ${titleClassName}`}
    >
      {title}
    </h1>
    {description && (
      <p
        className={`mt-2 whitespace-pre-line text-xs leading-[1.4] tracking-[-0.02em] text-[#A5A4A3] ${descClassName}`}
      >
        {description}
      </p>
    )}
  </div>
);

export default PageHeading;
