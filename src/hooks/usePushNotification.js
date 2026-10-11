import { useCallback, useState } from "react";
import {
  removePushSubscription,
  savePushSubscription,
} from "../api/notification";

// ─────────────────────────────────────────────────────────────
// PWA 웹푸시 알림 훅 (Service Worker + Push API + Notification API) -> api 연결하면서 검토 및 수정 필! ★
//  - public/sw.js 가 push / notificationclick 을 처리.
//  - VAPID 공개키(VITE_VAPID_PUBLIC_KEY)가 없으면(mock 단계) 권한 요청까지만 하고
//    구독(subscribe)은 건너뛰도록 구성. 대신 sendTest() 로 로컬 알림을 띄워서 확인할 수 있듬.
//  - iOS(Safari)는 "홈 화면에 추가"한 PWA 에서만 푸시가 가능 -> reason: "ios-install"
// ─────────────────────────────────────────────────────────────
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "";

const urlBase64ToUint8Array = (base64) => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

const isSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "Notification" in window;

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  navigator.standalone === true;

const usePushNotification = () => {
  const [permission, setPermission] = useState(() =>
    isSupported() ? Notification.permission : "unsupported",
  );

  // 알림 권한 요청 + (키가 있으면) 푸시 구독 -> 서버에 저장.  반환: { ok, reason? }
  const enable = useCallback(async () => {
    if (!isSupported()) return { ok: false, reason: "unsupported" };
    if (isIos() && !isStandalone()) return { ok: false, reason: "ios-install" };

    const result = await Notification.requestPermission();
    setPermission(result);
    if (result !== "granted") return { ok: false, reason: "denied" };

    if (VAPID_PUBLIC_KEY) {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }));
      await savePushSubscription(subscription.toJSON());
    }
    return { ok: true };
  }, []);

  // 구독 해지 (알림을 전부 끄고 싶을 때)
  const disable = useCallback(async () => {
    if (!isSupported()) return;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await removePushSubscription(subscription.endpoint);
      await subscription.unsubscribe();
    }
  }, []);

  // 로컬 테스트 알림 (서버 푸시 없이 Service Worker 가 직접 띄움)
  const sendTest = useCallback(
    async (title = "WEE", body = "오늘은 우산을 챙기세요 ☔") => {
      if (!isSupported() || Notification.permission !== "granted") return false;
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        data: { url: "/home" },
      });
      return true;
    },
    [],
  );

  return { permission, supported: isSupported(), enable, disable, sendTest };
};

export default usePushNotification;
