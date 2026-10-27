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
  const hasRecent = Boolean(localStorage.getItem("wee_access_token")) && recent.length > 0;
  const selectedName = typeof selected === "string" ? selected : selected?.regionName;
  const { data: results = [], isFetching: isSearchingRegions, isError: hasSearchError, refetch: retrySearch } = useRegionSearch(query);
  const { locate, loading: locating } = useCurrentRegion();

  const isSearching = focused || query.length > 0;

  const close = () => {
    setQuery("");
    setFocused(false);
    onClose?.();
  };

  const pick = (region, locationMode = "MANUAL") => {
    const regionName = typeof region === "string" ? region : region.regionName;
    selectRegion(regionName); // 최근 검색에 저장
    onSelect?.(regionName, { locationMode, region });
    close();
  };

  // "현재 위치로 찾기": 브라우저 위치 권한 → 좌표 → 지역명
  const handleLocate = async () => {
    const region = await locate();
    if (region) pick(region, "GPS");
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
      backdropClassName="bg-black/50"
      className="!h-[82dvh] !max-h-none !rounded-t-[20px] !pb-0"
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
            {query.trim().length < 2 && (
              <li className="py-6 text-center text-sm text-[#A5A4A3]">두 글자 이상 입력해주세요</li>
            )}
            {query.trim().length >= 2 && isSearchingRegions && (
              <li className="py-6 text-center text-sm text-[#A5A4A3]">지역을 검색하고 있어요...</li>
            )}
            {query.trim().length >= 2 && hasSearchError && (
              <li className="py-6 text-center text-sm text-[#A5A4A3]">
                지역을 검색하지 못했어요. {" "}
                <button type="button" onClick={() => retrySearch()} className="text-main underline">다시 시도</button>
              </li>
            )}
            {query.trim().length >= 2 && !isSearchingRegions && !hasSearchError && results.length === 0 && (
              <li className="py-6 text-center text-sm text-[#A5A4A3]">검색 결과가 없어요</li>
            )}
            {results.map((region) => (
              <li key={region.regionCode ?? region}>
                <button
                  type="button"
                  onClick={() => pick(region, "MANUAL")}
                  className="flex h-12 w-full items-center gap-[13px] px-3 text-left text-base font-medium tracking-[-0.02em] text-[#797776]"
                >
                  <img src={pinOutline} alt="" className="h-5 w-5 shrink-0" />
                  {typeof region === "string" ? region : region.regionName}
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

            {hasRecent && (
              <>
                <h3 className="mt-[27px] text-base font-semibold text-[#4C4A48]">최근 검색</h3>
                <ul className="mt-[17px]">
                  {recent.map((region) => {
                    const regionName = typeof region === "string" ? region : region?.regionName;
                    const regionKey = typeof region === "string" ? region : region?.regionCode ?? regionName;

                    return (
                      <li key={regionKey}>
                        <button
                          type="button"
                          onClick={() => pick(region, "RECENT")}
                          className="flex h-[49px] w-full items-center gap-[13px] px-3 text-left text-base font-medium tracking-[-0.02em] text-[#797776]"
                        >
                          <img src={timeIcon} alt="" className="h-[17px] w-[17px] shrink-0" />
                          <span className="flex-1">{regionName}</span>
                          {regionName === selectedName && <img src={checkIcon} alt="선택됨" className="h-3 w-[17px]" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </BottomSheet>
  );
};

export default LocationSearchSheet;
