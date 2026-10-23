import api from "./axios";

export const fetchCommunityPosts = async ({ tag, page = 1, pageSize = 10 }) => {
  const { data } = await api.get("/api/community/posts/", {
    params: { tag, page, pageSize },
  });
  return data;
};

export const fetchCommunityWeatherCopy = async () => {
  const { data } = await api.get("/api/community/weather-copy/");
  return data;
};

export const createCommunityPost = async ({ content, tag, image, location }) => {
  const formData = new FormData();
  formData.append("content", content.trim());
  formData.append("tag", tag);
  if (location) {
    formData.append("locationMode", "GPS");
    formData.append("lat", String(location.latitude));
    formData.append("lng", String(location.longitude));
  }
  if (image) formData.append("image", image);

  // Axios/browser supplies the multipart boundary and the shared interceptor adds the JWT.
  const { data } = await api.post("/api/community/posts/", formData);
  return data;
};

export const toggleCommunityPostLike = async (postId) => {
  const { data } = await api.post(`/api/community/posts/${postId}/like/`);
  return data;
};
