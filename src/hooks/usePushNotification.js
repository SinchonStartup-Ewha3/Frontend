import { useCallback, useState } from "react";
import { promptOneSignalPush } from "../push/oneSignal";

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
  (window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true);

const usePushNotification = () => {
  const [permission, setPermission] = useState(() =>
    isSupported() ? Notification.permission : "unsupported",
  );
  const iosInstallRequired = isIos() && !isStandalone();

  const enable = useCallback(async () => {
    if (!isSupported()) return { ok: false, reason: "unsupported" };
    if (isIos() && !isStandalone()) return { ok: false, reason: "ios-install" };
    if (Notification.permission === "denied") {
      setPermission("denied");
      return { ok: false, reason: "denied" };
    }

    await promptOneSignalPush();
    const nextPermission = Notification.permission;
    setPermission(nextPermission);
    return nextPermission === "granted"
      ? { ok: true }
      : { ok: false, reason: nextPermission === "denied" ? "denied" : "dismissed" };
  }, []);

  return {
    permission,
    supported: isSupported(),
    iosInstallRequired,
    enable,
  };
};

export default usePushNotification;
