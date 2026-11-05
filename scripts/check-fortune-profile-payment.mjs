import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { createServer } from 'vite';

const context = { state: {}, values: [], index: 0, effects: [], navigations: [], calls: [] };
globalThis.__fortuneFlowCheck = context;
const server = await createServer({ server: { middlewareMode: true, watch: null }, plugins: [{
  name: 'fortune-profile-flow-check', enforce: 'pre',
  transform(code, id) {
    if (!id.replaceAll('\\','/').includes('/src/pages/')) return;
    return code.replaceAll('"react"','"flow-react"').replaceAll('"react-router-dom"','"flow-router"')
      .replaceAll('"@tanstack/react-query"','"flow-query"').replaceAll('"../../api/fortune"','"flow-api"')
      .replaceAll('"../../hooks/usePayment"','"flow-payment"').replaceAll('"../../hooks/useFortunePayment"','"flow-payment"');
  },
  resolveId(source) {
    if (source.startsWith('flow-')) return `\0${source}`;
  },
  load(id) {
    if (id === '\0flow-react') return `export * from 'react';
      export const useState = initial => { const c=globalThis.__fortuneFlowCheck; const i=c.index++;
        if (!(i in c.values)) c.values[i]=typeof initial==='function'?initial():initial;
        return [c.values[i], value=>{c.values[i]=typeof value==='function'?value(c.values[i]):value;}]; };
      export const useEffect = fn => globalThis.__fortuneFlowCheck.effects.push(fn);`;
    if (id === '\0flow-router') return `export * from 'react-router-dom';
      export const useLocation = () => ({state:globalThis.__fortuneFlowCheck.state});
      export const useNavigate = () => (...args) => globalThis.__fortuneFlowCheck.navigations.push(args);`;
    if (id === '\0flow-query') return `export const useQuery=()=>({isPending:true});
      export const useQueryClient=()=>({invalidateQueries:async()=>{}, fetchQuery:async()=>{
        globalThis.__fortuneFlowCheck.calls.push('fortune'); return {id:1}; }});`;
    if (id === '\0flow-api') return `export const fetchFortuneProfile=async()=>{
        const c=globalThis.__fortuneFlowCheck; c.calls.push('profile'); if(c.profileError) throw c.profileError; return {}; };
      export const createFortuneProfile=async payload=>{
        const c=globalThis.__fortuneFlowCheck; c.calls.push(payload); if(c.saveError) throw c.saveError; return {}; };
      export const fetchTodayFortune=async()=>({id:1});`;
    if (id === '\0flow-payment') return `const query=()=>({data:{},isPending:false});
      export const usePremiumBillingQuery=query, useSubscriptionQuery=query, useRefundRequestQuery=query,
        useFortunePurchasesQuery=query, useFortuneRefundQuery=query;`;
  },
}] });
const reset = (state={}) => Object.assign(context, {state,values:[],index:0,effects:[],navigations:[],calls:[],profileError:null,saveError:null});
const find = (node, predicate) => {
  if (!node || typeof node !== 'object') return;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) { const match=find(child,predicate); if(match) return match; }
};
const click = (tree, label) => {
  const button=find(tree,node=>node.props?.children===label && typeof node.props?.onClick==='function');
  assert.ok(button, `Missing button: ${label}`); return button.props.onClick();
};
try {
  const load = async name => (await server.ssrLoadModule(`/src/pages/${name}.jsx`)).default;
  const Payment=await load('mypage/PaymentManagementPage');
  reset(); await click(Payment(),'운세 이용권 결제하러 가기');
  assert.equal(context.values[0],true); assert.equal(context.navigations.length,0);
  for (const [status,code] of [[404,'FORTUNE_PROFILE_NOT_FOUND'],[409,'FORTUNE_PROFILE_REQUIRED']]) {
    reset(); context.profileError={response:{status,data:{code}}};
    await click(Payment(),'운세 이용권 결제하러 가기');
    assert.deepEqual(context.navigations[0],['/weather-fortune/calendar',{state:{continueToPayment:true}}]);
    assert.equal(context.values[0],false);
  }
  reset(); context.profileError=new Error('Network error');
  await click(Payment(),'운세 이용권 결제하러 가기');
  assert.equal(context.navigations.length,0); assert.equal(context.values[0],false); assert.ok(context.values[2]);
  reset({openFortunePayment:true}); Payment(); assert.equal(context.values[0],true);

  const Calendar=await load('home/WeatherFortuneCalendarPage');
  reset({continueToPayment:true,calendarType:'SOLAR'}); click(Calendar(),'다음');
  let next=context.navigations[0]; assert.equal(next[0],'/weather-fortune/birth-info');
  const Birth=await load('home/WeatherFortuneBirthInfoPage');
  reset(next[1].state); click(Birth(),'다음'); next=context.navigations[0];
  assert.equal(next[0],'/weather-fortune/birth-time'); assert.equal(next[1].state.continueToPayment,true);
  const Time=await load('home/WeatherFortuneBirthTimePage');
  reset(next[1].state); await click(Time(),'완료'); next=context.navigations[0];
  assert.equal(next[0],'/weather-fortune/loading'); assert.equal(next[1].state.continueToPayment,true);
  const Loading=await load('home/WeatherFortuneLoadingPage');
  const payload=next[1].state.profilePayload;
  for (const alreadyExists of [false,true]) {
    reset({continueToPayment:true,profilePayload:payload});
    if(alreadyExists) context.saveError={response:{status:409,data:{code:'FORTUNE_PROFILE_ALREADY_EXISTS'}}};
    Loading(); context.effects.forEach(effect=>effect()); await setImmediate();
    assert.deepEqual(context.navigations[0],['/mypage/payment',{replace:true,state:{openFortunePayment:true}}]);
    assert.ok(!context.calls.includes('fortune'),'Payment registration must not generate a fortune before checkout');
  }
  reset({continueToPayment:true,profilePayload:payload}); context.saveError=new Error('Save failed');
  Loading(); context.effects.forEach(effect=>effect()); await setImmediate();
  assert.equal(context.navigations.length,0); assert.ok(context.values[1]);
  context.index=0; const retryTree=Loading(); assert.ok(find(retryTree,node=>node.props?.role==='alert'));
  reset({profilePayload:payload}); Loading(); context.effects.forEach(effect=>effect()); await setImmediate();
  assert.equal(context.navigations[0][0],'/weather-fortune/result'); assert.ok(context.calls.includes('fortune'));
  console.log('Fortune profile payment flow passed: existing/missing profile, network failure, registration continuation, save failure, and normal fortune flow.');
} finally { await server.close(); delete globalThis.__fortuneFlowCheck; }
