// OneSignal worker imports the existing sw.js handlers so the PWA and push
// click behavior continue to share a single root-scope service worker.
const registerSW = () => {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/OneSignalSDKWorker.js", { scope: "/" })
      .catch((e) => console.warn("SW 등록 실패", e));
  });
};

export default registerSW;
