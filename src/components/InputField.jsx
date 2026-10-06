import { useId } from "react";
const BASE =
  "w-full min-w-0 rounded-[0.75rem] border bg-white px-4 text-base font-medium leading-normal tracking-[-0.02em] text-[#252525] outline-none transition-colors placeholder:text-[#A5A4A3] focus:border-main disabled:cursor-not-allowed disabled:bg-[#F7F7F7] disabled:text-[#BCBBBA]";

// 검색 아이콘을 그리는 SVG 컴포넌트입니다.
const Magnifier = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5 shrink-0"
  >
    <circle
      cx="10.8"
      cy="10.8"
      r="6.8"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="m16 16 4.2 4.2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

// 일반 텍스트 입력창과 검색창에서 함께 사용하는 컴포넌트입니다.
export default function InputField({
  type = "text", // "text" 또는 "search"를 지정
  value, // 입력창에 표시할 값
  placeholder, // 입력 전 안내 문구
  onChange, // 입력 내용이 바뀔 때 호출
  onSubmit, // 검색 버튼을 누르거나 Enter를 누르면 호출
  disabled = false, // true이면 입력과 검색을 비활성화
  className = "", 
  id, 
  ...inputProps // maxLength, name 등 나머지 기본 input 속성
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

 
  const isSearch = type === "search" || type === "SearchField";


  const handleSubmit = (event) => {
    event.preventDefault();
    if (!disabled) onSubmit?.(value ?? "");
  };


  const handleKeyDown = (event) => {
    if (event.key === "Enter") handleSubmit(event);
  };


  if (!isSearch) {
    return (
      <input
        {...inputProps}
        id={inputId}
        type={type === "TextField" ? "text" : type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        className={`${BASE} h-12 border-[#E9E8E8] ${className}`}
      />
    );
  }


  return (
    <div
      role="search"
      className={`flex h-12 w-full min-w-0 items-center gap-3 rounded-[0.75rem] border border-[#E9E8E8] bg-white px-4 transition-colors focus-within:border-main ${
        disabled ? "bg-[#F7F7F7]" : ""
      } ${className}`}
    >
     
      <label htmlFor={inputId} className="sr-only">
        {placeholder || "검색"}
      </label>

      <input
        {...inputProps}
        id={inputId}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="h-full min-w-0 flex-1 bg-transparent text-base font-medium leading-normal tracking-[-0.02em] text-[#252525] outline-none placeholder:text-[#A5A4A3] disabled:cursor-not-allowed disabled:text-[#BCBBBA]"
      />

    
      <button
        type="button"
        aria-label="검색"
        onClick={handleSubmit}
        disabled={disabled}
        className="flex h-8 w-8 shrink-0 items-center justify-center text-[#797776] disabled:cursor-not-allowed disabled:text-[#BCBBBA]"
      >
        <Magnifier />
      </button>
    </div>
  );
}

// 검색 입력창만 따로 가져다 쓰고 싶을 때 사용하는 간편 컴포넌트.
export function SearchField(props) {
  return <InputField {...props} type="search" />;
}