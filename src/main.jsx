import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import ToastContainer from "./components/Toast.jsx";
import "./index.css";
import registerSW from "./pwa/registerSW.js";
import { PaddleCheckoutProvider } from "./providers/PaddleCheckoutProvider.jsx";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PaddleCheckoutProvider>
        <BrowserRouter>
          <App />
          <ToastContainer />
        </BrowserRouter>
      </PaddleCheckoutProvider>
    </QueryClientProvider>
  </StrictMode>,
);

// PWA: 서비스워커 등록 (푸시 알림 / 홈 화면 추가)
registerSW();
