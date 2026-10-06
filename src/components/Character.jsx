const weatherImages = import.meta.glob(
  "../assets/images/weather/*.svg",
  { eager: true, import: "default" },
);

const fortuneImages = import.meta.glob(
  "../assets/images/fortune/*.svg",
  { eager: true, import: "default" },
);

const SIZES = {
  small: "w-20",
  medium: "w-40",
  large: "w-56",
};

export default function Character({
  type,                  // "weather" 또는 "fortune"
  name,                  // 날씨 종류 또는 운세 캐릭터 이름
  size = "medium",
  className = "",
}) {
  const imagePath =
    type === "weather"
      ? `../assets/images/weather/weather_${name}_character.svg`
      : `../assets/images/fortune/fortune_${name}.svg`;
  const image =
    type === "weather"
      ? weatherImages[imagePath]
      : type === "fortune"
        ? fortuneImages[imagePath]
        : null;

  if (!image) return null;

  return (
    <img
      src={image}
      alt={`${type === "weather" ? "날씨" : "운세"} 캐릭터`}
      className={`block object-contain ${SIZES[size] ?? SIZES.medium} ${className}`}
    />
  );
}