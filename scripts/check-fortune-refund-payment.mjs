/* global process */
import assert from "node:assert/strict";
import {createServer} from "vite";

const server = await createServer({
  server:{middlewareMode:true,watch:null},
  plugins:[{
    name:'fortune-refund-payment-check', enforce:'pre',
    resolveId(source) {
      if (source === 'fortune-payment-entry') return '\0fortune-payment-entry';
      if (source.endsWith('/hooks/useFortunePayment')) return '\0fortune-payment-hooks';
      if (source.endsWith('/hooks/usePayment')) return '\0premium-payment-hooks';
    },
    load(id) {
      if (id === '\0fortune-payment-hooks') return `
        let state;
        export const setState = value => {state=value;};
        export const useFortunePurchasesQuery = () => state.purchases;
        export const useFortuneRefundQuery = () => state.refund;
        export const useCreateFortuneCheckout = () => ({});
        export const useFortuneProductsQuery = () => ({});
        export const useFortunePurchaseStatus = () => ({});
        export const useRefreshFortuneData = () => () => {};
      `;
      if (id === '\0premium-payment-hooks') return `
        export const usePremiumBillingQuery = () => ({data:{},isLoading:false,isError:false});
        export const useSubscriptionQuery = () => ({data:{},isLoading:false,isError:false});
        export const useRefundRequestQuery = () => ({data:null,isPending:false,isError:false});
      `;
      if (id === '\0fortune-payment-entry') return `
        import React from 'react';
        import {renderToStaticMarkup} from 'react-dom/server';
        import {MemoryRouter} from 'react-router-dom';
        import Page from '/src/pages/mypage/PaymentManagementPage.jsx';
        import {setState} from '/src/hooks/useFortunePayment';
        export function render(state) {
          setState(state);
          return renderToStaticMarkup(React.createElement(MemoryRouter,null,React.createElement(Page)));
        }
      `;
    },
  }],
});
const query = (data, extra={}) => ({data,isPending:false,isError:false,refetch(){},...extra});
try {
  const {render} = await server.ssrLoadModule('fortune-payment-entry');
  const state = (status, extra={}) => ({
    purchases:query({current:null,latest:{purchase_id:12,refund_status:status}}),
    refund:query(null), ...extra,
  });
  for (const status of ['REQUESTED','PROCESSING']) {
    const html = render(state(status));
    assert.doesNotMatch(html,/운세 이용권 결제하러 가기/);
    assert.match(html,/환불 상태 확인/);
    assert.doesNotMatch(html,/환불 신청 취소/);
    assert.doesNotMatch(render(state(null,{refund:query({purchaseId:12,status})})),/운세 이용권 결제하러 가기/);
  }
  for (const status of ['COMPLETED','REJECTED',null]) {
    assert.match(render(state(status)),/운세 이용권 결제하러 가기/);
  }
  assert.doesNotMatch(render(state(null,{purchases:query({current:{purchase_id:12}})})),/운세 이용권 결제하러 가기/);
  assert.doesNotMatch(render(state(null,{refund:query(null,{isPending:true})})),/운세 이용권 결제하러 가기/);
  assert.doesNotMatch(render(state(null,{refund:query(null,{isError:true})})),/운세 이용권 결제하러 가기/);
  process.stdout.write('Fortune refund payment visibility checks passed (10 scenarios).\n');
} finally { await server.close(); }
