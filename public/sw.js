// Shared PWA lifecycle hooks. OneSignalSDKWorker.js imports this file and
// delegates push display and notification-click URLs to the OneSignal worker.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
