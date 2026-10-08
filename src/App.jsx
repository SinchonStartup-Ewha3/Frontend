import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/onboarding/LoginPage.jsx";
import LoginCompletePage from "./pages/onboarding/LoginCompletePage.jsx";
import NicknamePage from "./pages/onboarding/NicknamePage.jsx";
import LocationSetupPage from "./pages/onboarding/LocationSetupPage.jsx";
import HomePage from "./pages/home/HomePage.jsx";
import WeatherFortunePage from "./pages/home/WeatherFortunePage.jsx";
import CommunityPage from "./pages/home/CommunityPage.jsx";
import SituationDetail from "./pages/situation/SituationDetail.jsx";
import LaundrySituationDetail from "./pages/situation/LaundrySituationDetail.jsx";
import RunningSituationDetail from "./pages/situation/RunningSituationDetail.jsx";
import CommunityWritePage from "./pages/home/CommunityWritePage.jsx";
import BirthdayInfoPage from "./pages/onboarding/BirthdayInfoPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login-complete" element={<LoginCompletePage />} />
      <Route path="/nickname" element={<NicknamePage />} />
      <Route path="/birth-info" element={<BirthdayInfoPage />} />
      <Route path="/location-setup" element={<LocationSetupPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/weather-fortune" element={<WeatherFortunePage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/community/write" element={<CommunityWritePage />} />
      <Route path="/situation" element={<SituationDetail />} />
      <Route path="/situation/detail" element={<SituationDetail />} />
      <Route path="/situation/laundry" element={<LaundrySituationDetail />} />
      <Route path="/situation/running" element={<RunningSituationDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
