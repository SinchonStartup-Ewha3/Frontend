const APP_ID = "1d3d0798-3038-4792-84df-8a8b7d066aaf";
// Use the same root-scope worker registered by the PWA. A second nested
// OneSignal worker can leave mobile browsers with competing registrations.
const WORKER_PATH = "OneSignalSDKWorker.js";
const INITIALIZATION_KEY = "__weeOneSignalInitialization";

let initialization;
let activeExternalId = null;
let loginInProgress = null;

export const initializeOneSignal = () => {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window[INITIALIZATION_KEY]) return window[INITIALIZATION_KEY];
  if (initialization) return initialization;

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  initialization = new Promise((resolve, reject) => {
    // Publish the shared promise before an already-loaded SDK runs the callback.
    queueMicrotask(() => window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.init({
          appId: APP_ID,
          serviceWorkerPath: WORKER_PATH,
          serviceWorkerParam: { scope: "/" },
        });
        resolve(OneSignal);
      } catch (error) {
        // Preserve failed initialization until reload; the SDK may already be active.
        if (error instanceof Error && error.message.startsWith("Can only be used on:")) {
          reject(new Error(`${error.message} / 현재 접속 주소: ${window.location.origin}`, { cause: error }));
          return;
        }
        reject(error);
      }
    }));
  });
  window[INITIALIZATION_KEY] = initialization;
  return initialization;
};

export const withOneSignal = async (callback) => {
  const OneSignal = await initializeOneSignal();
  if (!OneSignal) return null;
  return callback(OneSignal);
};

export const loginOneSignalUser = async (djangoUserId) => {
  if (
    djangoUserId === undefined ||
    djangoUserId === null ||
    String(djangoUserId).trim() === ""
  )
    return;
  const externalId = String(djangoUserId);
  if (activeExternalId === externalId) return;
  if (loginInProgress && loginInProgress.externalId === externalId) {
    return loginInProgress.promise;
  }

  const promise = withOneSignal(async (OneSignal) => {
    await OneSignal.login(externalId);
    activeExternalId = externalId;
  });
  loginInProgress = { externalId, promise };
  try {
    await promise;
  } finally {
    if (loginInProgress?.promise === promise) loginInProgress = null;
  }
};

export const logoutOneSignalUser = async () => {
  try {
    await withOneSignal(async (OneSignal) => {
      await OneSignal.logout();
    });
  } finally {
    activeExternalId = null;
  }
};

// 현재 푸시 구독 상태 (구독 ID가 있고 opt-in 되어 있어야 "구독됨")
export const getOneSignalPushState = () =>
  withOneSignal((OneSignal) => {
    const sub = OneSignal.User.PushSubscription;
    return { subscribed: Boolean(sub.optedIn && sub.id), id: sub.id ?? null };
  });

// 네이티브 알림 권한창을 바로 띄우고, 허용되면 OneSignal 구독까지 완료될 때까지 기다림
// (슬라이드다운 대신 사용 → 대시보드 프롬프트 설정과 무관하게 동작)
export const requestOneSignalPush = () =>
  withOneSignal(async (OneSignal) => {
    await OneSignal.Notifications.requestPermission();
    if (Notification.permission !== "granted") {
      return { permission: Notification.permission, subscribed: false };
    }
    await OneSignal.User.PushSubscription.optIn();
    // 구독 ID가 만들어질 때까지 최대 5초 대기
    for (let i = 0; i < 20 && !OneSignal.User.PushSubscription.id; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    const sub = OneSignal.User.PushSubscription;
    return {
      permission: Notification.permission,
      subscribed: Boolean(sub.optedIn && sub.id),
    };
  });

