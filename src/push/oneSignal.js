const APP_ID = "1d3d0798-3038-4792-84df-8a8b7d066aaf";
const WORKER_PATH = "push/onesignal/OneSignalSDKWorker.js";

let initialization;
let activeExternalId = null;

export const initializeOneSignal = () => {
  if (typeof window === "undefined") return Promise.resolve(null);
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
        initialization = null;
        reject(error);
      }
    });
  });
  return initialization;
};

export const withOneSignal = async (callback) => {
  const OneSignal = await initializeOneSignal();
  if (!OneSignal) return null;
  return callback(OneSignal);
};

export const loginOneSignalUser = async (djangoUserId) => {
  if (djangoUserId === undefined || djangoUserId === null || String(djangoUserId).trim() === "") return;
  const externalId = String(djangoUserId);
  if (activeExternalId === externalId) return;
  await withOneSignal(async (OneSignal) => {
    await OneSignal.login(externalId);
    activeExternalId = externalId;
  });
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

export const promptOneSignalPush = async () =>
  withOneSignal((OneSignal) => OneSignal.Slidedown.promptPush());
