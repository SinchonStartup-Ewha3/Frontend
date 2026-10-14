import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/onboarding/LoginPage.jsx";
import LoginCompletePage from "./pages/onboarding/LoginCompletePage.jsx";
import NicknamePage from "./pages/onboarding/NicknamePage.jsx";
import LocationSetupPage from "./pages/onboarding/LocationSetupPage.jsx";
import HomePage from "./pages/home/HomePage.jsx";
import WeatherFortunePage from "./pages/home/WeatherFortunePage.jsx";
import WeatherFortuneBirthInfoPage from "./pages/home/WeatherFortuneBirthInfoPage.jsx";
import WeatherFortuneCalendarPage from "./pages/home/WeatherFortuneCalendarPage.jsx";
import WeatherFortuneBirthTimePage from "./pages/home/WeatherFortuneBirthTimePage.jsx";
import WeatherFortuneLoadingPage from "./pages/home/WeatherFortuneLoadingPage.jsx";
import WeatherFortuneResultPage from "./pages/home/WeatherFortuneResultPage.jsx";
import CommunityPage from "./pages/community/CommunityPage.jsx";
import SituationDetail from "./pages/situation/SituationDetail.jsx";
import LaundrySituationDetail from "./pages/situation/LaundrySituationDetail.jsx";
import RunningSituationDetail from "./pages/situation/RunningSituationDetail.jsx";
import CommunityWritePage from "./pages/community/CommunityWritePage.jsx";
import PremiumPage from "./pages/premium/PremiumPage.jsx";
import PremiumSurveyPage from "./pages/premium/PremiumSurveyPage.jsx";
import PremiumSurveyCompletePage from "./pages/premium/PremiumSurveyCompletePage.jsx";
import PremiumWelcomePage from "./pages/premium/PremiumWelcomePage.jsx";
import PremiumScheduleSetupPage from "./pages/premium/PremiumScheduleSetupPage.jsx";
import PremiumScheduleAlertSettingsPage from "./pages/premium/PremiumScheduleAlertSettingsPage.jsx";
import MyPage from "./pages/mypage/MyPage.jsx";
import ProfileEditPage from "./pages/mypage/ProfileEditPage.jsx";
import NotificationSettingsPage from "./pages/mypage/NotificationSettingsPage.jsx";
import UmbrellaSchedulePage from "./pages/mypage/UmbrellaSchedulePage.jsx";
import PaymentManagementPage from "./pages/mypage/PaymentManagementPage.jsx";
import RefundAccountPage from "./pages/mypage/RefundAccountPage.jsx";
import MyActivityPage from "./pages/mypage/MyActivityPage.jsx";
import MyPostDetailPage from "./pages/mypage/MyPostDetailPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login-complete" element={<LoginCompletePage />} />
      <Route path="/nickname" element={<NicknamePage />} />
      <Route path="/location-setup" element={<LocationSetupPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/weather-fortune" element={<WeatherFortunePage />} />
      <Route path="/weather-fortune/calendar" element={<WeatherFortuneCalendarPage />} />
      <Route path="/weather-fortune/birth-info" element={<WeatherFortuneBirthInfoPage />} />
      <Route path="/weather-fortune/birth-time" element={<WeatherFortuneBirthTimePage />} />
      <Route path="/weather-fortune/loading" element={<WeatherFortuneLoadingPage />} />
      <Route path="/weather-fortune/result" element={<WeatherFortuneResultPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/community/write" element={<CommunityWritePage />} />
      <Route path="/premium" element={<PremiumPage />} />
      <Route path="/premium/onboarding/2" element={<PremiumPage />} />
      <Route path="/premium/onboarding/3" element={<PremiumPage />} />
      <Route path="/premium/onboarding/4" element={<PremiumPage />} />
      <Route path="/premium/survey" element={<PremiumSurveyPage />} />
      <Route path="/premium/survey/complete" element={<PremiumSurveyCompletePage />} />
      <Route path="/premium/welcome" element={<PremiumWelcomePage />} />
      <Route path="/premium/schedule-setup" element={<PremiumScheduleSetupPage />} />
      <Route path="/premium/schedule-alert-settings" element={<PremiumScheduleAlertSettingsPage />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/mypage/profile" element={<ProfileEditPage />} />
      <Route path="/mypage/notifications" element={<NotificationSettingsPage />} />
      <Route path="/mypage/notifications/umbrella" element={<UmbrellaSchedulePage />} />
      <Route path="/mypage/payment" element={<PaymentManagementPage />} />
      <Route path="/mypage/refund" element={<RefundAccountPage />} />
      <Route path="/mypage/activity" element={<MyActivityPage />} />
      <Route path="/mypage/activity/:postId" element={<MyPostDetailPage />} />
      <Route path="/situation" element={<SituationDetail />} />
      <Route path="/situation/detail" element={<SituationDetail />} />
      <Route path="/situation/laundry" element={<LaundrySituationDetail />} />
      <Route path="/situation/running" element={<RunningSituationDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
