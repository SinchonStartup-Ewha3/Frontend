 //highlighted는 하늘색 강조 카드 (마이페이지에 맨 위에 있는 프로필 카드)
export default function Card({ children, className = "", highlighted = false }) {
  return (
    <section
      className={`rounded-[13px] border-[1.5px] p-4 text-[#353331] ${
        highlighted ? "border-transparent bg-[#D4F3FA]" : "border-[#E9E8E8] bg-white"
      } ${className}`}
    >
      {children}
    </section>
  );
}
