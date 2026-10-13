import { useState } from "react";
import BottomSheet from "./BottomSheet";
import Button from "./Button";
import SearchBar from "./SearchBar";
import { useCurrentRegion, useRegionSearch } from "../hooks/useLocation";
import useToast from "../hooks/useToast";
import useLocationStore from "../store/useLocationStore";
import pinIcon from "../assets/icons/pin.svg";
import pinOutline from "../assets/icons/pin-outline.svg";
import timeIcon from "../assets/icons/time.svg";
import checkIcon from "../assets/icons/check.svg";

// 지역 검색 바텀시트 (온보딩 "지역 검색"과 같은 UI) — 프로필 수정 / 프리미엄 설문에서 사용
//  1) 기본: [현재 위치로 찾기] + 최근 검색 목록(선택된 곳엔 체크)
//  2) 검색창 입력/포커스: 검색 결과 목록(핀 아이콘) + "취소"
// 사용법: <LocationSearchSheet isOpen onClose={...} selected={region} onSelect={(region) => ...} />
const LocationSearchSheet = ({ isOpen, onClose, selected, onSelect }) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const toast = useToast();

  const recent = useLocationStore((s) => s.recent);
  const selectRegion = useLocationStore((s) => s.selectRegion);
  const { data: results = [] } = useRegionSearch(query);
  const { locate, loading: locating } = useCurrentRegion();

  const isSearching = focused || query.length > 0;

  const close = () => {
    setQuery("");
    setFocused(false);
    onClose?.();
  };

  const pick = (region) => {
    selectRegion(region); // 최근 검색에 저장
    onSelect?.(region);
    close();
  };

  // "현재 위치로 찾기": 브라우저 위치 권한 → 좌표 → 지역명
  const handleLocate = async () => {
    const region = await locate();
    if (region) pick(region);
    else toast.error("현재 위치를 찾지 못했어요. 위치 권한을 확인해 주세요");
  };

  const cancelSearch = () => {
    setQuery("");
    setFocused(false);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      title="지역 검색"
      onClose={close}
      showHandle={false}
      showHeader={false}
      className="h-[83dvh] !pb-0"
    >
      <div className="pt-[49px]">
        <SearchBar
          value={query}
          onChange={setQuery}
          onFocus={() => setFocused(true)}
          onCancel={cancelSearch}
          showCancel={isSearching}
        />

        {isSearching ? (
          // ── 검색 결과 ──
          <ul className="mt-4">
            {query.trim() && results.length === 0 && (
              <li className="py-6 text-center text-sm text-[#A5A4A3]">검색 결과가 없어요</li>
            )}
            {results.map((region) => (
              <li key={region}>
                <button
                  type="button"
                  onClick={() => pick(region)}
                  className="flex h-12 w-full items-center gap-[13px] px-3 text-left text-base font-medium tracking-[-0.02em] text-[#797776]"
                >
                  <img src={pinOutline} alt="" className="h-5 w-5 shrink-0" />
                  {region}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          // ── 현재 위치 + 최근 검색 ──
          <>
            <Button
              variant="soft"
              icon={pinIcon}
              onClick={handleLocate}
              disabled={locating}
              className="mt-4 !rounded-[10px] !text-sm"
            >
              {locating ? "위치 확인 중..." : "현재 위치로 찾기"}
            </Button>

            <h3 className="mt-[27px] text-base font-semibold text-[#4C4A48]">최근 검색</h3>
            <ul className="mt-[17px]">
              {recent.length === 0 && <li className="py-4 text-sm text-[#A5A4A3]">최근 검색한 지역이 없어요</li>}
              {recent.map((region) => (
                <li key={region}>
                  <button
                    type="button"
                    onClick={() => pick(region)}
                    className="flex h-[49px] w-full items-center gap-[13px] px-3 text-left text-base font-medium tracking-[-0.02em] text-[#797776]"
                  >
                    <img src={timeIcon} alt="" className="h-[17px] w-[17px] shrink-0" />
                    <span className="flex-1">{region}</span>
                    {region === selected && <img src={checkIcon} alt="선택됨" className="h-3 w-[17px]" />}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </BottomSheet>
  );
};

export default LocationSearchSheet;
