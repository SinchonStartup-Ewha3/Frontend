import searchIcon from "../assets/icons/search.svg";

// 위치 검색 바텀시트 전용 검색창
//  - 평소: 왼쪽 돋보기 + 안내 문구
//  - 입력/포커스 중(showCancel): 돋보기 숨기고 오른쪽에 "취소" 텍스트 버튼 표시
// (기존 InputField 의 search 타입은 "오른쪽 돋보기 + 흰 배경"이라 모양이 달라서 따로 만들었어요)
const SearchBar = ({
  value,
  onChange,
  onFocus,
  onCancel,
  showCancel = false,
  placeholder = "지역명을 검색하세요",
}) => (
  <div className="flex items-center gap-3">
    <label
      className={`flex h-[60px] min-w-0 flex-1 items-center rounded-[15px] bg-[#F4F4F4] ${
        showCancel ? "px-[26px]" : "gap-[11px] px-[29px]"
      }`}
    >
      <span className="sr-only">지역명 검색</span>
      {!showCancel && (
        <img src={searchIcon} alt="" className="h-5 w-5 shrink-0" />
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-base font-medium tracking-[-0.02em] text-[#252525] outline-none placeholder:text-[#C1C1C1]"
      />
    </label>
    {showCancel && (
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 text-sm font-semibold text-main"
      >
        취소
      </button>
    )}
  </div>
);

export default SearchBar;
