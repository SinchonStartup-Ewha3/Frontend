import BottomNav from "./BottomNav";
// nav를 fixed로 둘 예정이라서, pb-26 nav 있을 때 nav 포함 하단 padding 값으로 두었습니다.
// 좌우 여백용 레이아웃 틀!!!이라고 보시면 될 거 같아요
const PageLayout = ({ children, nav = true, className = "" }) => (
  <div className={`min-h-screen px-6 ${nav ? "pb-26" : "pb-24"} ${className}`}>
    {children}
    {nav && <BottomNav />}
  </div>
);

export default PageLayout;
