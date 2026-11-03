/* global process */
import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({server:{middlewareMode:true,watch:null}});
try {
  const {getFortuneCharacter, getFortuneCharacterName, FORTUNE_CHARACTER_GROUPS:groups} = await server.ssrLoadModule("/src/utils/fortuneCharacter.js");
  const names = Object.values(groups).flat();
  assert.equal(names.length, 24);
  assert.equal(new Set(names).size, 24);
  for (const [level, candidates] of Object.entries(groups)) {
    const urls = new Set();
    for (let day = 1; day <= candidates.length; day += 1) {
      const now = new Date(Date.UTC(2026, 10, day, 3));
      const image = getFortuneCharacter(level, now);
      assert.ok(image);
      assert.equal(getFortuneCharacter(level, now), image);
      urls.add(image);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      assert.notEqual(getFortuneCharacter(level, tomorrow), image);
    }
    assert.equal(urls.size, candidates.length, `${level} must use all its characters`);
    assert.equal(getFortuneCharacter(level, new Date('2026-11-03T00:01:00+09:00')),
      getFortuneCharacter(level, new Date('2026-11-03T23:59:00+09:00')));
    assert.notEqual(getFortuneCharacter(level, new Date('2026-11-03T23:59:00+09:00')),
      getFortuneCharacter(level, new Date('2026-11-04T00:00:00+09:00')));
  }
  const now = new Date('2026-11-03T12:00:00+09:00');
  assert.equal(getFortuneCharacter('UNKNOWN', now), getFortuneCharacter('NORMAL', now));
  assert.equal(getFortuneCharacter(undefined, now), getFortuneCharacter('NORMAL', now));
  const themes = {
    crown:'승진의 기회가 찾아오는 날', clover:'금전운이 좋은 날', rainbow:'희망이 찾아오는 날',
    party:'축제를 즐겨보세요', sunshine:'햇살을 즐기는 하루', angel:'귀인이 찾아옵니다',
    heart:'사랑이 찾아오는 하루', sprout:'새 출발의 첫걸음', musician:'음악으로 채우는 하루',
    artist:'창의적인 아이디어가 떠올라요', traveler:'여행을 떠나보세요', scholar:'공부에 집중하세요',
    book:'독서를 즐겨보세요', balance:'균형을 지키세요', cloud:'구름이 가득한 하루',
    detective:'꼼꼼하게 확인하세요', wind:'바람이 부는 날', rain:'비 오는 날 우산을 챙기세요',
    moon:'고요한 달빛 아래', wizard:'직감을 따라보세요', devil:'충동과 과소비를 조심하세요',
    lightning:'천둥과 번개가 치는 하루', snow:'눈꽃이 피는 추운 날', sleep:'피로를 풀고 쉬어가세요',
  };
  for (const [name, title] of Object.entries(themes)) {
    const fortune = {luck_level:'NORMAL', title};
    assert.equal(getFortuneCharacterName(fortune, now), name, title);
    assert.ok(getFortuneCharacter(fortune, now));
    assert.equal(getFortuneCharacter(fortune, now), getFortuneCharacter(fortune, new Date('2026-11-04T12:00:00+09:00')));
  }
  assert.equal(getFortuneCharacterName({title:'연애에 설렘이 있는 날', detail_text:'지출을 점검하고 신중하게 판단하세요'}, now), 'heart');
  assert.equal(getFortuneCharacterName({summary:'피로를 풀고 휴식하세요'}, now), 'sleep');
  assert.equal(getFortuneCharacterName({detail_text:'새로운 장소로 여행을 떠나세요'}, now), 'traveler');
  assert.equal(getFortuneCharacterName({lucky_item:'우산'}, now), 'rain');
  assert.equal(getFortuneCharacterName({luck_level:'GOOD', title:'오늘 하루를 보내세요'}, now), getFortuneCharacterName('GOOD', now));
  assert.equal(getFortuneCharacterName({luck_level:'GOOD', title:'대비가 필요하고 책임을 지는 하루'}, now), getFortuneCharacterName('GOOD', now));
  process.stdout.write("Fortune character checks passed: 24 content themes, title priority, stable content matching, and level/date fallback.\n");
} finally {
  await server.close();
}
