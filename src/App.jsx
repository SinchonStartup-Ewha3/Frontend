import { useState } from "react";
import BottomSheet from "./components/BottomSheet";
import BottomNav from "./components/BottomNav";
import Card from "./components/Card";
import Character from "./components/Character";
import Chip from "./components/Chip";
import Header from "./components/Header";
import InputField from "./components/InputField";
import ListRow from "./components/ListRow";
import StatBox from "./components/StatBox";
import Toggle from "./components/Toggle";

// 미리보기할 날씨 아이콘 파일을 직접 불러옵니다.
import cloudIcon from "./assets/icons/cloud_icon.svg";
import cloudsIcon from "./assets/icons/clouds.svg";
import moonIcon from "./assets/icons/moon_icon.svg";
import raindropIcon from "./assets/icons/raindrop_icon.svg";
import snowflakeIcon from "./assets/icons/snowflake_icon.svg";
import sunIcon from "./assets/icons/sun_icon.svg";
import windIcon from "./assets/icons/wind_icon.svg";

const weatherIcons = [
  ["구름", cloudIcon],
  ["흐림", cloudsIcon],
  ["달", moonIcon],
  ["빗방울", raindropIcon],
  ["눈송이", snowflakeIcon],
  ["해", sunIcon],
  ["바람", windIcon],
];

export default function App() {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isToggleOn, setIsToggleOn] = useState(true);
  const [isChipActive, setIsChipActive] = useState(false);
  const [text, setText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState("검색어를 입력해 보세요.");

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-[#252525]">
      <main className="mx-auto min-h-screen w-full max-w-[430px] space-y-8 bg-white px-5 pb-32 pt-6">
        <div>
          <h1 className="text-2xl font-semibold">feat/yeseon 미리보기</h1>
          <p className="mt-1 text-sm text-[#797776]">
            브랜치에서 만든 컴포넌트를 확인하는 화면입니다.
          </p>
        </div>

        {/* Header의 뒤로 가기와 좌우 버튼 모양을 확인합니다. */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Header</h2>
          <Header back onLeft={() => setMessage("뒤로 가기를 눌렀습니다.")} />
          <Header
            left="취소"
            right="등록"
            onLeft={() => setMessage("취소를 눌렀습니다.")}
            onRight={() => setMessage("등록을 눌렀습니다.")}
          />
        </section>

        {/* Chip을 눌러 선택 상태가 바뀌는지 확인합니다. */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Chip</h2>
          <div className="flex gap-2">
            <Chip active>선택됨</Chip>
            <Chip active={isChipActive} onClick={() => setIsChipActive((value) => !value)}>
              눌러서 변경
            </Chip>
          </div>
        </section>

        {/* Toggle을 눌러 켜짐과 꺼짐 상태를 확인합니다. */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Toggle</h2>
          <div className="flex items-center gap-4">
            <Toggle on={isToggleOn} onChange={() => setIsToggleOn((value) => !value)} />
            <Toggle
              size="sm"
              on={isToggleOn}
              onChange={() => setIsToggleOn((value) => !value)}
            />
            <span className="text-sm text-[#797776]">
              {isToggleOn ? "켜짐" : "꺼짐"}
            </span>
          </div>
        </section>

        {/* 일반 입력과 검색 입력의 작동을 확인합니다. */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">InputField</h2>
          <InputField
            value={text}
            placeholder="텍스트를 입력해 보세요"
            onChange={(event) => setText(event.target.value)}
          />
          <InputField
            type="search"
            value={searchText}
            placeholder="검색어를 입력해 보세요"
            onChange={(event) => setSearchText(event.target.value)}
            onSubmit={(value) => setMessage(`검색어: ${value || "(비어 있음)"}`)}
          />
          <p className="text-sm text-[#797776]">{message}</p>
        </section>

        {/* Card의 기본 모양과 강조 모양을 비교합니다. */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Card</h2>
          <Card>
            <p className="font-semibold">기본 카드</p>
            <p className="mt-1 text-sm text-[#797776]">일반 카드 스타일</p>
          </Card>
          <Card highlighted>
            <p className="font-semibold">강조 카드</p>
            <p className="mt-1 text-sm text-[#797776]">하늘색 배경 스타일</p>
          </Card>
        </section>

        {/* ListRow를 눌렀을 때 항목별 동작을 확인합니다. */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">ListRow</h2>
          <div className="divide-y divide-[#E9E8E8]">
            <ListRow onClick={() => setMessage("기본 항목을 선택했습니다.")}>
              기본 항목
            </ListRow>
            <ListRow
              variant="accent"
              onClick={() => setMessage("강조 항목을 선택했습니다.")}
            >
              강조 항목
            </ListRow>
            <ListRow
              variant="danger"
              onClick={() => setMessage("삭제 항목을 선택했습니다.")}
            >
              삭제 항목
            </ListRow>
          </div>
          <p className="text-sm text-[#797776]">{message}</p>
        </section>

        {/* StatBox에 표시되는 이름과 값을 확인합니다. */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">StatBox</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="강수 확률" value="10%" />
            <StatBox label="체감 온도" value="19°" />
          </div>
        </section>

        {/* 대표 캐릭터 몇 개만 표시해 종류별 이미지 연결을 확인합니다. */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Character</h2>
          <div className="grid grid-cols-4 gap-3">
            <Character type="weather" name="rain" size="small" />
            <Character type="weather" name="sunny" size="small" />
            <Character type="fortune" name="cloud" size="small" />
            <Character type="fortune" name="heart" size="small" />
          </div>
        </section>

        {/* 추가된 날씨 아이콘 파일을 직접 보여줍니다. */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">날씨 아이콘</h2>
          <div className="grid grid-cols-4 gap-3">
            {weatherIcons.map(([label, icon]) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-xl border border-[#E9E8E8] p-3"
              >
                <img src={icon} alt="" className="h-8 w-8 object-contain" />
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 버튼을 눌러 BottomSheet를 열 수 있습니다. */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">BottomSheet</h2>
          <button
            type="button"
            onClick={() => setIsBottomSheetOpen(true)}
            className="w-full rounded-[10px] bg-main px-4 py-3 font-semibold text-white"
          >
            바텀시트 열기
          </button>
        </section>

        {/* 닫기 버튼, 배경 클릭, Escape 키로 닫히는지 확인합니다. */}
        <BottomSheet
          isOpen={isBottomSheetOpen}
          title="바텀시트 미리보기"
          onClose={() => setIsBottomSheetOpen(false)}
        >
          <p className="text-sm leading-6 text-[#797776]">
            화면별 콘텐츠가 들어가는 영역입니다.
          </p>
          <button
            type="button"
            onClick={() => setIsBottomSheetOpen(false)}
            className="mt-6 w-full rounded-[10px] bg-main px-4 py-3 font-semibold text-white"
          >
            닫기
          </button>
        </BottomSheet>
      </main>

      {/* 프로젝트의 라우터 안에서 하단 메뉴를 미리보기합니다. */}
      <BottomNav />
    </div>
  );
}