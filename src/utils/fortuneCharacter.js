const images = import.meta.glob("../assets/images/fortune/fortune_*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

export const FORTUNE_CHARACTER_GROUPS = {
  GREAT: ["crown", "clover", "rainbow", "party", "sunshine"],
  GOOD: ["heart", "book", "musician", "artist", "sprout"],
  NORMAL: ["cloud", "moon", "scholar", "traveler", "wizard"],
  CAUTION: ["detective", "balance", "rain", "wind", "lightning"],
  BAD: ["sleep", "devil", "snow", "angel"],
};

// 서버 코드와 로컬 이미지 파일명이 다른 캐릭터도 명시적으로 매칭해요.
export const FORTUNE_CHARACTER_IMAGES = {
  KING: "crown", RAINBOW: "rainbow", SUNSHINE: "sunshine", CLOVER: "clover", PARTY: "party",
  HEART: "heart", STARRY: "book", MUSICIAN: "musician", PAINTER: "artist", SPROUT: "sprout",
  CLOUD: "cloud", MOONLIGHT: "moon", SCHOLAR: "scholar", TRAVELER: "traveler", WIZARD: "wizard",
  DETECTIVE: "detective", BALANCE: "balance", RAIN_CLOUD: "rain", BREEZE: "wind", THUNDER: "lightning",
  SLEEPY: "sleep", DEVIL: "devil", SNOWFLAKE: "snow", ANGEL: "angel",
};

// 제목·요약의 주제를 우선하고, 상세 풀이와 행운 정보로 보완해요.
// 짧은 '비', '책', '눈' 대신 구체적인 표현으로 일상 단어의 오탐을 줄여요.
const CHARACTER_THEMES = {
  crown: /성공|성과|승진|인정받|인정 받|리더|주인공|정상에|목표 달성/,
  clover: /행운|횡재|금전|재물|금전운|뜻밖의 기회/,
  rainbow: /희망|무지개|전화위복|반전|고비를 넘|비 온 뒤/,
  party: /축하|축제|파티|기념일|생일|모임|축하받/,
  sunshine: /햇살|햇빛|화창|맑은 날|맑게 갠|쾌청/,
  angel: /도움|배려|친절|귀인|위로|따뜻한 말|응원/,
  heart: /사랑|연애|애정|설렘|설레|고백|데이트|인연/,
  sprout: /성장|새로운 시작|새 출발|첫걸음|도전|씨앗|새싹/,
  musician: /음악|노래|멜로디|연주|공연|리듬|콘서트/,
  artist: /창의|창작|예술|그림|미술|영감|아이디어|디자인/,
  traveler: /여행|이동|외출|산책|낯선 곳|새로운 장소|모험|탐험/,
  scholar: /공부|학습|시험|배움|자격증|연구|지식/,
  book: /독서|책을|책과|책 한|서적|도서관|기록|일기|글쓰기/,
  balance: /균형|조화|중용|우선순위|선택|판단|저울|결정/,
  cloud: /구름|흐린|흐림|먹구름|불확실|막막/,
  detective: /확인|점검|꼼꼼|주의|신중|실수|살펴|검토/,
  wind: /바람|강풍|돌풍|변화|유연|방향 전환/,
  rain: /빗방울|비 오는|비가 내|우산|장마|소나기|빗소리/,
  moon: /달빛|밤하늘|고요|차분|명상|내면|성찰/,
  wizard: /마법|직감|직관|신비|상상|뜻밖의 해결/,
  devil: /유혹|충동|욕심|과소비|다툼|분노|감정 조절/,
  lightning: /번개|천둥|급변|돌발|긴급|갑작스|갑작스러/,
  snow: /눈이 내|눈 오는|눈꽃|눈송이|함박눈|폭설|추위|한파|보온/,
  sleep: /휴식|수면|잠을|숙면|쉬어|쉬는|재충전|피로|회복/,
};

function hashText(text) {
  let hash = 0;
  for (const character of text) hash = (Math.imul(hash, 31) + character.codePointAt(0)) >>> 0;
  return hash;
}

export function getFortuneCharacterName(fortune, now = new Date()) {
  const data = fortune && typeof fortune === "object" ? fortune : { luck_level: fortune };
  const mappedCharacter = FORTUNE_CHARACTER_IMAGES[data.character];
  if (mappedCharacter) return mappedCharacter;
  const serverCharacter = typeof data.character === "string" ? data.character.toLowerCase() : "";
  if (images[`../assets/images/fortune/fortune_${serverCharacter}.svg`]) return serverCharacter;
  const fields = [
    [data.title, 8], [data.summary, 3],
    // 서버가 캐릭터를 지정한 결과는 무료·유료에서 같은 공개 정보만으로 보완해요.
    [data.character ? null : data.detail_text, 1],
    [data.lucky_item, 1], [data.lucky_place, 1],
  ].filter(([text]) => typeof text === "string" && text.trim());
  let highestScore = 0;
  let matches = [];
  for (const [name, pattern] of Object.entries(CHARACTER_THEMES)) {
    const score = fields.reduce((total, [text, weight]) => total + (pattern.test(text) ? weight : 0), 0);
    if (score > highestScore) {
      highestScore = score;
      matches = [name];
    } else if (score > 0 && score === highestScore) matches.push(name);
  }
  if (matches.length) {
    // 같은 내용은 날짜나 새로고침과 무관하게 같은 캐릭터를 보여줘요.
    return matches[hashText(fields.map(([text]) => text).join("\n")) % matches.length];
  }

  // 구체적인 주제가 없는 경우에만 한국 날짜와 운세 등급으로 선택해요.
  const luckLevel = data.luck_level;
  const candidates = FORTUNE_CHARACTER_GROUPS[luckLevel] ?? FORTUNE_CHARACTER_GROUPS.NORMAL;
  const targetDay = typeof data.target_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.target_date)
    ? Date.parse(`${data.target_date}T00:00:00+09:00`) : NaN;
  const timestamp = Number.isFinite(targetDay) ? targetDay : now.getTime();
  const day = Math.floor((timestamp + 9 * 60 * 60 * 1000) / (24 * 60 * 60 * 1000));
  const index = ((day % candidates.length) + candidates.length) % candidates.length;
  return candidates[index];
}

export function getFortuneCharacter(fortune, now = new Date()) {
  const name = getFortuneCharacterName(fortune, now);
  return images[`../assets/images/fortune/fortune_${name}.svg`];
}
