/* global process */
import assert from "node:assert/strict";
import { createServer } from "vite";

// Render the real page with controlled API query results. No payment is submitted.
const server = await createServer({
  server: { middlewareMode: true, watch: null },
  plugins: [{
    name: "refund-query-fixtures",
    enforce: "pre",
    resolveId(source) {
      if (source === "refund-test-hooks" || source.endsWith("/hooks/usePayment")) return "\0refund-payment-hooks";
      if (source.endsWith("/hooks/useToast")) return "\0refund-toast";
      if (source === "refund-test-entry") return "\0refund-test-entry";
    },
    load(id) {
      if (id === "\0refund-payment-hooks") return `
        let state;
        export const setState = (value) => { state = value; };
        export const usePremiumBillingQuery = () => state.billing;
        export const useSubscriptionQuery = () => state.subscription;
        export const useRefundRequestQuery = () => state.refund;
        export const useRequestRefund = () => state.mutation;
      `;
      if (id === "\0refund-toast") return "export default () => ({ error() {} });";
      if (id === "\0refund-test-entry") return `
        import React from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import { MemoryRouter } from 'react-router-dom';
        import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
        import Page from '/src/pages/mypage/RefundAccountPage.jsx';
        import { setState } from 'refund-test-hooks';
        export function render(state) {
          setState(state);
          return renderToStaticMarkup(React.createElement(QueryClientProvider,
            { client: new QueryClient() },
            React.createElement(MemoryRouter, null, React.createElement(Page))));
        }
      `;
    },
  }],
});

const query = (data, extra = {}) => ({
  data, isPending: false, isError: false, refetch() {}, ...extra,
});
const state = (extra = {}) => ({
  billing: query({ subscription: { canRequestRefund: true } }),
  subscription: query({ canRequestRefund: false, subscription: { canRequestRefund: false } }),
  refund: query(null),
  mutation: { data: null, isPending: false },
  ...extra,
});

try {
  const { render } = await server.ssrLoadModule("refund-test-entry");
  assert.match(render(state()), /id="refund-reason"/, "Billing eligibility must open the form even when status says false");
  assert.match(render(state({ subscription: query({}) })), /id="refund-reason"/, "Status may omit refund eligibility");
  assert.match(render(state({ billing: query({ subscription: null }), subscription: query({ canRequestRefund: true }) })), /id="refund-reason"/, "Keep status-based eligibility supported");
  assert.match(render(state({ billing: query({ subscription: null }) })), /환불 가능한 프리미엄 결제 내역이 없어요/);
  for (const key of ["billing", "subscription", "refund"]) {
    const failed = render(state({ [key]: query(undefined, { isError: true }) }));
    assert.match(failed, /다시 시도/);
    assert.doesNotMatch(failed, /환불 가능한 프리미엄 결제 내역이 없어요|id="refund-reason"/);
    const pending = render(state({ [key]: query(undefined, { isPending: true }) }));
    assert.match(pending, /환불 요청 내역을 확인하고 있어요/);
    assert.doesNotMatch(pending, /환불 가능한 프리미엄 결제 내역이 없어요/);
  }
  const requested = { status: "REQUESTED", requestedAmount: 2380, reason: "테스트" };
  assert.match(render(state({ refund: query(requested), billing: query(undefined, { isError: true }) })), /환불 요청 접수/);
  assert.match(render(state({ mutation: { data: requested }, billing: query(undefined, { isPending: true }) })), /환불 요청 접수/);
  process.stdout.write("Premium refund regression checks passed (12 scenarios).\n");
} finally {
  await server.close();
}
