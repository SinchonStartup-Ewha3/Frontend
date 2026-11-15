import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FortunePaymentSheet from "../../components/FortunePaymentSheet.jsx";
import queryKeys from "../../api/queryKeys.js";

const previewQueryClient = new QueryClient();
previewQueryClient.setQueryData(queryKeys.fortuneProducts, [
  { id: "preview-7", title: "1주 패키지", duration_days: 7, price: 5900 },
  { id: "preview-14", title: "2주 패키지", duration_days: 14, price: 11600 },
  { id: "preview-21", title: "3주 패키지", duration_days: 21, price: 16000 },
  { id: "preview-1", title: "하루 이용권", duration_days: 1, price: 1000 },
]);

export default function FortunePaymentPreview() {
  return (
    <QueryClientProvider client={previewQueryClient}>
      <FortunePaymentSheet isOpen onClose={() => {}} />
    </QueryClientProvider>
  );
}
