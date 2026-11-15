import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WeatherFortuneResultPage from "../home/WeatherFortuneResultPage.jsx";
import queryKeys from "../../api/queryKeys.js";

const previewQueryClient = new QueryClient();
previewQueryClient.setQueryDefaults(queryKeys.todayFortune, { staleTime: Infinity });
previewQueryClient.setQueryData(queryKeys.todayFortune, {
  title: "맑음",
  weather_label: "맑음",
  luck_level: "GOOD",
  detail_locked: false,
  lucky_color: "하늘색",
  lucky_item: "텀블러",
  lucky_place: "공원",
  summary: "기본 좋은 일이 하나쯤 찾아올 거예요.",
  category_fortunes: [
    {
      code: "ACADEMIC",
      label: "업무운",
      title: "차분하게 집중해보세요",
      interpretation: "오늘은 서두르기보다 순서를 정해 하나씩 마무리하면 좋은 결과를 얻을 수 있어요. 작은 진전도 놓치지 말고 스스로 칭찬해주세요.",
      rating: 4,
    },
    {
      code: "LOVE",
      label: "연애운",
      title: "마음을 천천히 표현해보세요",
      interpretation: "가벼운 안부 한마디가 대화를 이어주는 계기가 될 수 있어요. 상대의 이야기를 잘 들어주면 편안한 분위기가 만들어집니다.",
      rating: 3,
    },
    {
      code: "MONEY",
      label: "금전운",
      title: "작은 지출을 살펴보세요",
      interpretation: "계획에 없던 소비는 한 번 더 생각해보세요. 필요한 곳에 쓰면 만족도가 높은 하루예요.",
      rating: 4,
    },
    {
      code: "RELATIONSHIPS",
      label: "인간관계운",
      title: "먼저 다정하게 말을 건네보세요",
      interpretation: "오늘은 주변 사람들과 편안하게 마음을 나눌 수 있는 날이에요. 작은 배려가 좋은 분위기를 만들고, 오해가 있었다면 부드럽게 풀어갈 수 있어요.",
      rating: 4,
    },
  ],
});

export default function FortuneResultPreview() {
  return (
    <QueryClientProvider client={previewQueryClient}>
      <WeatherFortuneResultPage />
    </QueryClientProvider>
  );
}
