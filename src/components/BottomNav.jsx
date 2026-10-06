import { NavLink } from "react-router-dom";
import communityIcon from "../assets/icons/community.svg";
import communityActiveIcon from "../assets/icons/community-active.svg";
import homeIcon from "../assets/icons/home.svg";
import homeActiveIcon from "../assets/icons/home-active.svg";
import situationIcon from "../assets/icons/situation.svg";
import situationActiveIcon from "../assets/icons/situation-active.svg";
import mypageIcon from "../assets/icons/mypage.svg";
import mypageActiveIcon from "../assets/icons/mypage-active.svg";
// 일단 라우트 구조는 community/home/situation/mypage/premium 이렇게 임의로 정해서 만들었습니당
// 추후에 라우팅 코드 짜면서 수정하면 될 거 같아요 ^3^
const ITEMS = [
  {
    to: "/community",
    icon: communityIcon,
    activeIcon: communityActiveIcon,
    label: "커뮤니티",
  },
  { to: "/home", icon: homeIcon, activeIcon: homeActiveIcon, label: "홈" },
  {
    to: "/situation",
    icon: situationIcon,
    activeIcon: situationActiveIcon,
    label: "상황별 정보",
  },
  {
    to: "/mypage",
    icon: mypageIcon,
    activeIcon: mypageActiveIcon,
    label: "마이페이지",
  },
];

const BottomNav = () => (
  <nav className="fixed bottom-[2.875rem] left-1/2 -translate-x-1/2 w-63 h-13.5 rounded-[28.55819rem] border-[1.771px] border-solid border-[#E9E8E8] bg-white grid grid-cols-4 place-items-center">
    {ITEMS.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === "/"}
        aria-label={item.label}
        className={({ isActive }) =>
          `w-11.25 h-11.25 rounded-full flex items-center justify-center ${isActive ? "bg-main" : ""}`
        }
      >
        {({ isActive }) => (
          <img
            src={isActive ? item.activeIcon : item.icon}
            alt=""
            className="h-[1.1rem] object-cover"
          />
        )}
      </NavLink>
    ))}
  </nav>
);

export default BottomNav;
