// 서비스워커(public/sw.js) 등록,,, 기능 확인용! 일단 HTTPS 또는 localhost 에서만 동작함!!
// 푸시 수신/알림 클릭 처리는 sw.js 에 이미 있음!!
const registerSW = () => {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((e) => console.warn("SW 등록 실패", e));
  });
};

export default registerSW;
