const CATEGORY_ORDER = ["ACADEMIC", "LOVE", "MONEY", "WEATHER", "COMMUTE", "RELATIONSHIPS"];

function getRating(category) {
  if (category.rating !== undefined && category.rating !== null) {
    const rating = Number(category.rating);
    return Number.isFinite(rating)
      ? Math.max(0, Math.min(5, Math.round(rating)))
      : 0;
  }
  if (category.score !== undefined && category.score !== null) {
    const score = Number(category.score);
    return Number.isFinite(score)
      ? Math.max(0, Math.min(5, Math.round((score / 100) * 5)))
      : 0;
  }
  return 0;
}

export default function FortuneDetailContent({ fortune }) {
  if (fortune?.detail_locked !== false) return null;

  const categories = Array.isArray(fortune.category_fortunes)
    ? [...fortune.category_fortunes].sort((a, b) => {
        const aIndex = CATEGORY_ORDER.indexOf(a.code);
        const bIndex = CATEGORY_ORDER.indexOf(b.code);
        return (aIndex < 0 ? CATEGORY_ORDER.length : aIndex) - (bIndex < 0 ? CATEGORY_ORDER.length : bIndex);
      })
    : [];

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <article
          key={category.code ?? category.label}
          aria-label={category.label}
          className="relative min-h-[188px] rounded-[20px] border border-[#D2D2D1]/60 px-[33px] pb-5 pt-[17px]"
        >
          <div className="mb-[7px] flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-[7px] text-[14px] font-semibold leading-[1.5] tracking-[-0.42px]">
              <span aria-hidden="true" className="h-[6px] w-[6px] rounded-full bg-[#60E1FF]" />
              {category.label}
            </h3>
            <div className="flex items-center gap-[3px]" aria-label={`운수 점수 ${getRating(category)}점 / 5점`}>
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  className={`h-[4px] w-[4px] rounded-full ${index < getRating(category) ? "bg-[#60E1FF]" : "bg-[#E9E8E8]"}`}
                />
              ))}
            </div>
          </div>
          {category.title && (
            <p className="mb-[7px] text-[12px] font-semibold leading-[1.5] tracking-[-0.36px] text-[#353331]">
              {category.title}
            </p>
          )}
          <p className="whitespace-pre-line break-words text-[12px] font-medium leading-[1.5] tracking-[-0.36px] text-[#797776]">
            {category.interpretation}
          </p>
        </article>
      ))}
      {categories.length === 0 && fortune.detail_text && (
        <article className="min-h-[188px] rounded-[20px] border border-[#D2D2D1]/60 px-[33px] py-[18px]">
          <p className="whitespace-pre-line break-words text-[12px] font-medium leading-[1.6] text-[#797776]">
            {fortune.detail_text}
          </p>
        </article>
      )}
      {categories.length === 0 && !fortune.detail_text && (
        <article className="min-h-[188px] rounded-[20px] border border-[#D2D2D1]/60 px-[33px] py-[18px] text-[12px] text-[#797776]">
          상세 풀이가 아직 준비되지 않았어요.
        </article>
      )}
    </div>
  );
}
