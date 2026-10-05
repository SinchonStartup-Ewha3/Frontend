// 푸시 알림용 서비스 워커
// 아이콘은 임시로 그냥 아무 이미지나 만들어서 넣음 192, 512
// 추후에 수정 예정
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  const d = e.data
    ? e.data.json()
    : { title: "WEE", body: "오늘의 날씨를 확인해보세요" };
  e.waitUntil(
    self.registration.showNotification(d.title, {
      body: d.body,
      icon: "/icons/icon-192.png",
      data: { url: d.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow(e.notification.data.url));
});
