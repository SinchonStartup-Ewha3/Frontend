// 모바일의 새 창 지원 여부에 의존하지 않고 현재 탭에서 결제를 진행해요.
export const navigateToPayment = (paymentUrl) => {
  window.location.assign(paymentUrl);
};
