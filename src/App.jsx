import { useEffect, useRef } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "./api/user";
import queryKeys from "./api/queryKeys";
import useUserStore from "./store/useUserStore";
import Button from "./components/Button";
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
import CommunityEditPage from "./pages/community/CommunityEditPage.jsx";
import PremiumPage from "./pages/premium/PremiumPage.jsx";
import PremiumLandingPage from "./pages/premium/PremiumLandingPage.jsx";
import PremiumPaymentMethodPage from "./pages/premium/PremiumPaymentMethodPage.jsx";
import PremiumBankTransferPage from "./pages/premium/PremiumBankTransferPage.jsx";
import PremiumDepositPendingPage from "./pages/premium/PremiumDepositPendingPage.jsx";
import PublicPolicyPage from "./pages/legal/PublicPolicyPage.jsx";
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
import LoginRequiredModal from "./components/LoginRequiredModal.jsx";
import { USE_MOCK } from "./api/config";
import { loginOneSignalUser } from "./push/oneSignal";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("wee_access_token");
  const setUser = useUserStore((state) => state.setUser);
  const hasResolvedSession = useRef(false);
  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfile,
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (USE_MOCK || !token || !profileQuery.data) return;
    const djangoUserId =
      profileQuery.data.userId ?? profileQuery.data.id ?? profileQuery.data.pk;
    if (djangoUserId === undefined || djangoUserId === null) return;
    loginOneSignalUser(djangoUserId).catch((error) =>
      console.warn("OneSignal 사용자 연결 실패", error),
    );
  }, [profileQuery.data, token]);

  useEffect(() => {
    if (!token || !profileQuery.data || hasResolvedSession.current) return;

    const user = profileQuery.data;
    const isNicknameSet =
      user.isNicknameSet ??
      Boolean(user.nickname && !user.nickname.startsWith("user_"));
    const isOnboarded =
      user.isOnboarded ?? Boolean(isNicknameSet && user.region);

    setUser(user);
    hasResolvedSession.current = true;
    if (location.pathname === "/login-complete") return;
    if (!isNicknameSet) navigate("/nickname", { replace: true });
    else if (!isOnboarded) navigate("/location-setup", { replace: true });
    else if (location.pathname === "/" || location.pathname === "/login") {
      navigate("/home", { replace: true });
    }
  }, [location.pathname, navigate, profileQuery.data, setUser, token]);

  if (token && profileQuery.isPending) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-white text-base font-semibold text-[#797776]">
        내 정보를 불러오는 중...
      </main>
    );
  }

  if (token && profileQuery.isError && !profileQuery.data) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-6 text-center text-[#797776]">
        <p>내 정보를 불러오지 못했어요.</p>
        <Button
          onClick={() => profileQuery.refetch()}
          disabled={profileQuery.isFetching}
        >
          다시 시도
        </Button>
      </main>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/login-complete"
        element={
          <RequireAuth>
            <LoginCompletePage />
          </RequireAuth>
        }
      />
      <Route
        path="/nickname"
        element={
          <RequireAuth>
            <NicknamePage />
          </RequireAuth>
        }
      />
      <Route path="/location-setup" element={<LocationSetupPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route
        path="/weather-fortune"
        element={
          <RequireAuth>
            <WeatherFortunePage />
          </RequireAuth>
        }
      />
      <Route
        path="/weather-fortune/calendar"
        element={
          <RequireAuth>
            <WeatherFortuneCalendarPage />
          </RequireAuth>
        }
      />
      <Route
        path="/weather-fortune/birth-info"
        element={
          <RequireAuth>
            <WeatherFortuneBirthInfoPage />
          </RequireAuth>
        }
      />
      <Route
        path="/weather-fortune/birth-time"
        element={
          <RequireAuth>
            <WeatherFortuneBirthTimePage />
          </RequireAuth>
        }
      />
      <Route
        path="/weather-fortune/loading"
        element={
          <RequireAuth>
            <WeatherFortuneLoadingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/weather-fortune/result"
        element={
          <RequireAuth>
            <WeatherFortuneResultPage />
          </RequireAuth>
        }
      />
      <Route path="/community" element={<CommunityPage />} />
      <Route
        path="/community/write"
        element={
          <RequireAuth>
            <CommunityWritePage />
          </RequireAuth>
        }
      />
      <Route
        path="/community/edit/:postId"
        element={
          <RequireAuth>
            <CommunityEditPage />
          </RequireAuth>
        }
      />
      <Route path="/premium" element={<PremiumLandingPage />} />
      <Route
        path="/premium/payment-method"
        element={
          <RequireAuth>
            <PremiumPaymentMethodPage />
          </RequireAuth>
        }
      />
      <Route
        path="/premium/bank-transfer"
        element={
          <RequireAuth>
            <PremiumBankTransferPage />
          </RequireAuth>
        }
      />
      <Route
        path="/premium/bank-transfer/pending"
        element={
          <RequireAuth>
            <PremiumDepositPendingPage />
          </RequireAuth>
        }
      />
      <Route path="/terms" element={<PublicPolicyPage />} />
      <Route path="/privacy" element={<PublicPolicyPage />} />
      <Route path="/refund" element={<PublicPolicyPage />} />
      <Route path="/contact" element={<PublicPolicyPage />} />
      <Route path="/premium/onboarding/1" element={<PremiumPage />} />
      <Route path="/premium/onboarding/2" element={<PremiumPage />} />
      <Route path="/premium/onboarding/3" element={<PremiumPage />} />
      <Route path="/premium/onboarding/4" element={<PremiumPage />} />
      <Route
        path="/premium/survey"
        element={
          <RequireAuth>
            <PremiumSurveyPage />
          </RequireAuth>
        }
      />
      <Route
        path="/premium/survey/complete"
        element={
          <RequireAuth>
            <PremiumSurveyCompletePage />
          </RequireAuth>
        }
      />
      <Route
        path="/premium/welcome"
        element={
          <RequireAuth>
            <PremiumWelcomePage />
          </RequireAuth>
        }
      />
      <Route
        path="/premium/schedule-setup"
        element={
          <RequireAuth>
            <PremiumScheduleSetupPage />
          </RequireAuth>
        }
      />
      <Route
        path="/premium/schedule-alert-settings"
        element={
          <RequireAuth>
            <PremiumScheduleAlertSettingsPage />
          </RequireAuth>
        }
      />
      <Route path="/mypage" element={<MyPage />} />
      <Route
        path="/mypage/profile"
        element={
          <RequireAuth>
            <ProfileEditPage />
          </RequireAuth>
        }
      />
      <Route
        path="/mypage/notifications"
        element={
          <RequireAuth>
            <NotificationSettingsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/mypage/notifications/umbrella"
        element={
          <RequireAuth>
            <UmbrellaSchedulePage />
          </RequireAuth>
        }
      />
      <Route
        path="/mypage/payment"
        element={
          <RequireAuth>
            <PaymentManagementPage />
          </RequireAuth>
        }
      />
      <Route
        path="/mypage/refund"
        element={
          <RequireAuth>
            <RefundAccountPage />
          </RequireAuth>
        }
      />
      <Route
        path="/mypage/activity"
        element={
          <RequireAuth>
            <MyActivityPage />
          </RequireAuth>
        }
      />
      <Route
        path="/mypage/activity/:postId"
        element={
          <RequireAuth>
            <MyPostDetailPage />
          </RequireAuth>
        }
      />
      <Route path="/situation" element={<SituationDetail />} />
      <Route path="/situation/detail" element={<SituationDetail />} />
      <Route path="/situation/laundry" element={<LaundrySituationDetail />} />
      <Route path="/situation/running" element={<RunningSituationDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RequireAuth({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("wee_access_token");
  const localPremiumPreviewPaths = [
    "/premium/payment-method",
    "/premium/bank-transfer",
    "/premium/survey",
    "/premium/bank-transfer/pending",
  ];
  const isLocalPremiumPreview =
    import.meta.env.DEV &&
    new URLSearchParams(location.search).get("preview") === "1" &&
    localPremiumPreviewPaths.includes(location.pathname);
  if (token || isLocalPremiumPreview) return children;
  const returnTo = `${location.pathname}${location.search}`;
  return (
    <LoginRequiredModal
      isOpen
      onClose={() => navigate("/home", { replace: true })}
      onLogin={() =>
        navigate("/login", { state: { from: returnTo } })
      }
    />
  );
}
