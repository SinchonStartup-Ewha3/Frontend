// 화면 맨 아래에 붙는 버튼 영역 (MobileLayout 이 relative 라서 그 안에서 absolute 로 배치).
//  - bottomClassName 으로 위치만 바꿀 수 있어요.
const BottomCTA = ({
  children,
  bottomClassName = "bottom-[103px]",
  className = "",
}) => (
  <div className={`absolute inset-x-6 ${bottomClassName} ${className}`}>
    {children}
  </div>
);

export default BottomCTA;
