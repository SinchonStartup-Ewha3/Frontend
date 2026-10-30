// 결제창을 띄운 뒤 아직 결과를 모르는 주문을 기억해 둬요.
// (결제창 탭에서 돌아오거나, 결제 결과 화면으로 복귀해도 같은 주문을 이어서 확인하기 위함)
// sessionStorage 는 탭마다 따로라서, 결제창을 새 탭으로 띄우면 복귀 탭에서 못 읽어요 -> localStorage 사용
const KEY = "wee_fortune_pending_purchase";
const TTL_MS = 30 * 60 * 1000;

export const savePendingFortunePurchase = ({
  purchaseId,
  paymentUrl,
  productTitle,
}) => {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        purchaseId,
        paymentUrl,
        productTitle,
        createdAt: Date.now(),
      }),
    );
  } catch {
    /* 저장 공간 문제는 무시 */
  }
};

export const loadPendingFortunePurchase = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.purchaseId || Date.now() - (parsed.createdAt ?? 0) > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const clearPendingFortunePurchase = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* 무시 */
  }
};
