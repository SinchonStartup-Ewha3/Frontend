// 커뮤니티(게시글) 공통 상수 — 작성 / 수정 화면에서 같이 사용

// 명세의 tag 값은 cardigan · padded · coat 중 하나
export const COMMUNITY_TAGS = [
  { label: "가디건", value: "cardigan" },
  { label: "패딩", value: "padded" },
  { label: "코트", value: "coat" },
];

// 게시글 내용 최대 글자 수 (명세: 최대 200자)
export const MAX_CONTENT_LENGTH = 200;

// 사진 조건 (명세: 최대 1장, 5MB 이하, JPG·PNG·WEBP)
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
