import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/onboarding/LoginPage.jsx";
import LoginCompletePage from "./pages/onboarding/LoginCompletePage.jsx";
import NicknamePage from "./pages/onboarding/NicknamePage.jsx";
import LocationSetupPage from "./pages/onboarding/LocationSetupPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login-complete" element={<LoginCompletePage />} />
      <Route path="/nickname" element={<NicknamePage />} />
      <Route path="/location-setup" element={<LocationSetupPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
