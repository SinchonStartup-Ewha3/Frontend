import assert from "node:assert/strict";
import { navigateToPayment } from "../src/utils/paymentWindow.js";
import { savePendingFortunePurchase, loadPendingFortunePurchase } from "../src/utils/fortunePayment.js";

const originalWindow = globalThis.window;
const originalStorage = globalThis.localStorage;
const paymentUrl = "https://example.com/pay/checkout";
try {
  const storage = new Map();
  globalThis.localStorage = {
    setItem(key, value) { storage.set(key, value); },
    getItem(key) { return storage.get(key) ?? null; },
    removeItem(key) { storage.delete(key); },
  };
  const pending = { purchaseId: 123, paymentUrl, productTitle: "Fortune pass" };
  let redirected;
  globalThis.window = {
    open() { assert.fail("Checkout must not depend on popup support"); },
    location: { assign(url) {
      assert.equal(loadPendingFortunePurchase()?.purchaseId, pending.purchaseId);
      redirected = url;
    } },
  };
  const checkout = await Promise.resolve(pending);
  savePendingFortunePurchase(checkout);
  navigateToPayment(checkout.paymentUrl);
  assert.equal(redirected, paymentUrl);
  const restored = loadPendingFortunePurchase();
  assert.equal(restored.purchaseId, pending.purchaseId);
  assert.equal(restored.paymentUrl, paymentUrl);
  redirected = undefined;
  navigateToPayment(restored.paymentUrl);
  assert.equal(redirected, paymentUrl);

  globalThis.window.location.assign = () => { throw new Error("Navigation blocked"); };
  assert.throws(() => navigateToPayment(paymentUrl), /Navigation blocked/);
  assert.equal(loadPendingFortunePurchase().purchaseId, pending.purchaseId);
  console.log("Payment navigation checks passed: no popup, async checkout, saved order recovery, and navigation error propagation.");
} finally {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  if (originalStorage === undefined) delete globalThis.localStorage;
  else globalThis.localStorage = originalStorage;
}
