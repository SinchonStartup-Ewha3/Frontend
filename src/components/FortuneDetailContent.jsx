const CATEGORY_EMOJIS = {
  ACADEMIC: "📚",
  LOVE: "💗",
  RELATIONSHIPS: "🤝",
  MONEY: "💰",
  WEATHER: "🌤️",
  COMMUTE: "🚌",
};

export default function FortuneDetailContent({ fortune }) {
  // 잠금 상태에서는 응답에 상세 내용이 섞여 있어도 DOM에 넣지 않아요.
  if (fortune?.detail_locked !== false) return null;

  const categories = fortune.category_fortunes;
  return (
    <div className="space-y-6">
      {fortune.detail_text && (
        <p className="whitespace-pre-line break-words">{fortune.detail_text}</p>
      )}
      {Array.isArray(categories) && categories.length > 0 ? (
        <div className="space-y-6">
          {categories.map((category) => (
            <section key={category.code} aria-label={category.label}>
              <h3 className="mb-3 inline-flex items-center gap-[6px] rounded-full bg-[#F3F3F3] px-3 py-[5px] text-[14px] font-semibold text-[#353331]">
                {CATEGORY_EMOJIS[category.code] && (
                  <span aria-hidden="true" className="text-[16px] leading-none">
                    {CATEGORY_EMOJIS[category.code]}
                  </span>
                )}
                {category.label}
              </h3>
              <p className="whitespace-pre-line break-words text-[15px] leading-[1.7] text-[#62605F]">
                {category.interpretation}
              </p>
            </section>
          ))}
        </div>
      ) : !fortune.detail_text ? (
        <p>상세 풀이가 아직 준비되지 않았어요.</p>
      ) : null}
    </div>
  );
}
