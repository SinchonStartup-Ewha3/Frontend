/* global process */
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({server:{middlewareMode:true,watch:null}});
try {
  const {default:Details} = await server.ssrLoadModule('/src/components/FortuneDetailContent.jsx');
  const {default:Character} = await server.ssrLoadModule('/src/components/FortuneCharacterImage.jsx');
  const {getFortuneCharacter, getFortuneCharacterName} = await server.ssrLoadModule('/src/utils/fortuneCharacter.js');
  const categories = [
    ['ACADEMIC','학업운'], ['LOVE','연애운'], ['RELATIONSHIPS','인간관계운'],
    ['MONEY','재물운'], ['WEATHER','날씨운'], ['COMMUTE','통학운'],
  ].map(([code,label]) => ({code,label,interpretation:`${label}의 상세 내용\n줄바꿈 풀이`,score:99}));
  const fortune = {target_date:'2026-11-03',title:'오늘의 테루테루',character:'HEART',luck_level:'NORMAL',
    image_url:null,detail_text:'이전 종합 풀이',category_fortunes:categories,detail_locked:false};
  const render = (Component, data) => renderToStaticMarkup(React.createElement(Component,{fortune:data}));
  const paid = render(Details,fortune);
  let index = -1;
  for (const category of categories) {
    const next = paid.indexOf(`${category.label}</h3>`);
    assert.ok(next > index, 'Category order must match the API');
    index = next;
    assert.ok(paid.includes(category.interpretation));
  }
  assert.doesNotMatch(paid,/99|이전 종합 풀이|progress|meter/);
  assert.equal(render(Details,{...fortune,detail_locked:true}), '');
  assert.equal(render(Details,{...fortune,detail_locked:undefined}), '');
  assert.match(render(Details,{...fortune,category_fortunes:null}),/이전 종합 풀이/);
  assert.match(render(Details,{...fortune,category_fortunes:[]}),/이전 종합 풀이/);
  assert.match(render(Details,{...fortune,category_fortunes:null,detail_text:null}),/아직 준비되지/);

  const url='https://example.com/fortune/heart.png';
  assert.ok(render(Character,{...fortune,image_url:url}).includes(`src="${url}"`));
  assert.ok(render(Character,fortune).includes(`src="${getFortuneCharacter(fortune)}"`));
  assert.equal(getFortuneCharacterName({...fortune,title:'공부에 집중하세요'}), 'heart');
  const unknown = {...fortune,character:'CUSHION',title:'포근한 쿠션 테루테루',summary:'잔잔하게 흘러가는 편안한 하루예요'};
  assert.equal(getFortuneCharacter({...unknown,detail_text:null,detail_locked:true}), getFortuneCharacter({...unknown,detail_text:'연애에 좋은 날',detail_locked:false}));
  assert.equal(getFortuneCharacter(unknown,new Date('2026-11-03T00:00:00+09:00')), getFortuneCharacter(unknown,new Date('2026-11-20T00:00:00+09:00')));
  process.stdout.write('Fortune API response checks passed: category order, locked privacy, null fallback, server image/code priority, and target-date stability.\n');
} finally { await server.close(); }
