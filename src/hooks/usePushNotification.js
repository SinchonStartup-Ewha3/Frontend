import { useCallback, useEffect, useState } from "react";
import {
  getOneSignalPushState,
  initializeOneSignal,
  requestOneSignalPush,
} from "../push/oneSignal";

const isSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "Notification" in window;

const isIos = () =>
  typeof navigator !== "undefined" &&
  (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches ||
    navigator.standalone === true);

const usePushNotification = () => {
  const [permission, setPermission] = useState(() =>
    isSupported() ? Notification.permission : "unsupported",
  );
  // OneSignal 구독 여부: null = 확인 중, true/false = 확인 완료
  // (브라우저 권한이 "허용"이어도 구독이 안 만들어졌을 수 있어서 따로 확인
  const [subscribed, setSubscribed] = useState(null);
  const iosInstallRequired = isIos() && !isStandalone();

  // 화면에 들어오면 OneSignal을 미리 초기화해 두고 구독 상태를 읽기
  // -> 버튼을 누르는 순간 바로 권한창이 떠야 iOS에서도 막히지 않을 거 같아서
  useEffect(() => {
    if (!isSupported() || iosInstallRequired) return;
    initializeOneSignal()
      .then(() => getOneSignalPushState())
      .then((state) => setSubscribed(Boolean(state?.subscribed)))
      .catch((error) => {
        console.warn("OneSignal 초기화 실패", error);
        setSubscribed(false);
      });
  }, [iosInstallRequired]);

  const enable = useCallback(async () => {
    if (!isSupported()) return { ok: false, reason: "unsupported" };
    if (isIos() && !isStandalone()) return { ok: false, reason: "ios-install" };
    if (Notification.permission === "denied") {
      setPermission("denied");
      return { ok: false, reason: "denied" };
    }

    try {
      const result = await requestOneSignalPush();
      setPermission(Notification.permission);
      setSubscribed(Boolean(result?.subscribed));
      if (result?.subscribed) return { ok: true };
      return {
        ok: false,
        reason: Notification.permission === "denied" ? "denied" : "dismissed",
      };
    } catch (error) {
      console.error("푸시 구독 실패", error); // 원인 확인용 로그
      return { ok: false, reason: "failed" };
    }
  }, []);

  return {
    permission,
    subscribed,
    supported: isSupported(),
    iosInstallRequired,
    enable,
  };
};

export default usePushNotification;
