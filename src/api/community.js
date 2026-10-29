import api from "./axios";

// 숫자가 아니거나 0 이하면 기본값 사용 (명세: pageSize 는 양의 정수만 허용)
const toPositiveInt = (value, fallback) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
};

// 전체 조회는 tag=all, 태그별 조회는 cardigan/padded/coat/other를 전달해요.
// 로그인 선택: 토큰이 있으면 axios 인터셉터가 자동으로 붙여줘요.
export const fetchCommunityPosts = async ({ tag, page = 1, pageSize = 10 } = {}) => {
  // 전체 탭은 tag=all이 필수예요. undefined/null/빈 문자열로 빠져도
  // 백엔드에 태그 누락 요청이 나가지 않도록 기본값을 다시 보정해요.
  const requestedTag = typeof tag === "string" && tag.trim() ? tag.trim() : "all";
  const { data } = await api.get("/api/community/posts/", {
    params: {
      tag: requestedTag,
      page: toPositiveInt(page, 1),
      pageSize: Math.min(toPositiveInt(pageSize, 10), 30), // 명세: 최대 30
    },
  });
  return data;
};

// 커뮤니티 날씨 문구 (로그인 선택)
//  - 위치 우선순위: regionCode > lat,lng > 로그인 사용자의 저장 지역
//  - 비로그인은 regionCode 또는 lat,lng 가 꼭 필요 / lat 과 lng 는 항상 같이 보내야
export const fetchCommunityWeatherCopy = async ({
  regionCode,
  lat,
  lng,
} = {}) => {
  const params = regionCode
    ? { regionCode }
    : lat != null && lng != null
      ? { lat, lng }
      : undefined;
  const { data } = await api.get("/api/community/weather-copy/", { params });
  return data;
};

// 게시글 작성 (multipart/form-data)
//  - location 이 있으면 현재 위치(CURRENT) + lat/lng, 없으면 계정에 저장된 지역(SAVED)
export const createCommunityPost = async ({
  content,
  tag,
  image,
  location,
}) => {
  const formData = new FormData();
  formData.append("content", content.trim());
  formData.append("tag", tag);
  if (location) {
    formData.append("locationMode", "CURRENT");
    formData.append("lat", String(location.latitude));
    formData.append("lng", String(location.longitude));
  } else {
    formData.append("locationMode", "SAVED");
  }
  if (image) formData.append("image", image);

  // Axios/browser supplies the multipart boundary and the shared interceptor adds the JWT.
  const { data } = await api.post("/api/community/posts/", formData);
  return data;
};

// 게시글 수정 (PATCH: 보낸 필드만 수정) — 작성 당시 저장된 지역은 수정할 수 없음
//  - content / tag / image 중 바꾼 것만 넘기기
export const updateCommunityPost = async ({ postId, content, tag, image }) => {
  const formData = new FormData();
  if (content !== undefined) formData.append("content", content.trim());
  if (tag !== undefined) formData.append("tag", tag);
  if (image) formData.append("image", image);

  const { data } = await api.patch(`/api/community/posts/${postId}/`, formData);
  return data;
};

export const toggleCommunityPostLike = async (postId) => {
  const { data } = await api.post(`/api/community/posts/${postId}/like/`);
  return data;
};
