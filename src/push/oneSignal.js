const APP_ID = "1d3d0798-3038-4792-84df-8a8b7d066aaf";
const WORKER_PATH = "push/onesignal/OneSignalSDKWorker.js";
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
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.init({
          appId: APP_ID,
          serviceWorkerPath: WORKER_PATH,
          serviceWorkerParam: { scope: "/push/onesignal/" },
        });
        resolve(OneSignal);
      } catch (error) {
        window[INITIALIZATION_KEY] = null;
        initialization = null;
        reject(error);
      }
    });
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

// 푸시 재설정 1회 제한용 플래그 (무한 새로고침 방지)
export const PUSH_RESET_KEY = "wee_push_reset_done";

// 기존 기기에 남은 OneSignal 흔적(서비스워커·푸시 구독·로컬 DB·저장소)을 정리하고 ㅠ..
// 대시보드에서 기기를 삭제해도 폰에 남아 있는 예전 상태가 충돌하는 경우를 풀어주면?
export const resetOneSignalLocalState = async () => {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map(async (registration) => {
        try {
          const sub = await registration.pushManager?.getSubscription();
          await sub?.unsubscribe();
        } catch {
          /* 이미 만료된 구독은 무시 */
        }
        try {
          await registration.unregister();
        } catch {
          /* 무시 */
        }
      }),
    );
  } catch {
    /* 서비스워커 조회 실패는 무시 */
  }

  try {
    const dbs = (await indexedDB.databases?.()) ?? [];
    const names = dbs
      .map((db) => db.name)
      .filter((name) => /onesignal/i.test(name ?? ""));
    if (!names.includes("ONE_SIGNAL_SDK_DB")) names.push("ONE_SIGNAL_SDK_DB");
    names.forEach((name) => indexedDB.deleteDatabase(name));
  } catch {
    /* 무시 */
  }

  [localStorage, sessionStorage].forEach((storage) => {
    Object.keys(storage)
      .filter((key) => /onesignal/i.test(key))
      .forEach((key) => storage.removeItem(key));
  });

  // 메모리에 남은 초기화 상태도 비우면..?
  window[INITIALIZATION_KEY] = null;
  initialization = null;
  activeExternalId = null;
};
