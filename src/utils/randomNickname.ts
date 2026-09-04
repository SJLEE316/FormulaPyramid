const ADJECTIVES = [
  "행복한",
  "용감한",
  "즐거운",
  "귀여운",
  "날쌘한",
  "똑똑한",
  "엉뚱한",
  "신나는",
  "포근한",
  "씩씩한",
];

const ANIMALS = [
  "여우",
  "고양이",
  "강아지",
  "토끼",
  "판다",
  "호랑이",
  "펭귄",
  "다람쥐",
  "부엉이",
  "코알라",
];

/** 랭킹용 랜덤 닉네임 생성 (형용사+동물+숫자, 최대 12자) */
export function generateRandomNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(Math.random() * 10000);
  return `${adj}${animal}${num}`;
}
