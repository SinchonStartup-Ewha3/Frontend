/* global process */
import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true, watch: null },
  plugins: [{
    name: "community-cache-check",
    resolveId(source) {
      if (source === "community-cache-entry") return "\0community-cache-entry";
    },
    load(id) {
      if (id !== "\0community-cache-entry") return;
      return `
        import React from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
        import { useUpdateMyPost } from '/src/hooks/useActivity.js';
        import keys from '/src/api/queryKeys.js';
        export async function deleteImage(post) {
          const client = new QueryClient();
          client.setQueryData(keys.myPost('12'), post);
          client.setQueryData(keys.communityPost('12'), post);
          let update;
          function Probe() { update = useUpdateMyPost(); return null; }
          renderToStaticMarkup(React.createElement(QueryClientProvider, {client}, React.createElement(Probe)));
          await update.mutateAsync({postId:'12', removeImage:true});
          const result = {mine:client.getQueryData(keys.myPost('12')), detail:client.getQueryData(keys.communityPost('12'))};
          client.clear();
          return result;
        }
      `;
    },
  }],
});
const previousStorage = globalThis.localStorage;
globalThis.localStorage = { getItem: (key) => key === "wee_access_token" ? "test-access-token" : null };

try {
  const { updateCommunityPost } = await server.ssrLoadModule("/src/api/community.js");
  const { default: api } = await server.ssrLoadModule("/src/api/axios.js");
  const requests = [];
  let response = { postId:12 };
  api.defaults.adapter = async (config) => {
    requests.push(config);
    return { data: response, status:200, statusText:"OK", headers:{}, config };
  };

  await updateCommunityPost({ postId:12, content:"  수정된 내용  ", tag:"padded" });
  let request = requests.at(-1);
  assert.equal(request.method, "patch");
  assert.equal(request.url, "/api/community/posts/12/");
  assert.equal(request.headers.get("Authorization"), "Bearer test-access-token");
  assert.match(request.headers.get("Content-Type"), /application\/json/);
  assert.deepEqual(JSON.parse(request.data), {content:"수정된 내용", tag:"padded"});

  await updateCommunityPost({ postId:12, removeImage:true });
  assert.deepEqual(JSON.parse(requests.at(-1).data), {removeImage:true});

  const image = new File(["test image"], "photo.webp", {type:"image/webp"});
  await updateCommunityPost({ postId:12, image, tag:"coat" });
  request = requests.at(-1);
  assert.ok(request.data instanceof FormData);
  assert.deepEqual([...request.data.keys()], ["tag", "image"]);
  assert.equal(request.data.get("tag"), "coat");
  assert.equal(request.data.get("image").name, "photo.webp");

  await updateCommunityPost({ postId:12, content:"가".repeat(200) });
  const count = requests.length;
  for (const payload of [
    {image, removeImage:true},
    {content:"가".repeat(201)},
    {content:"   "},
    {tag:"invalid"},
    {image:new File(["bad"], "file.gif", {type:"image/gif"})},
    {image:new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.jpg", {type:"image/jpeg"})},
    {removeImage:"true"},
  ]) {
    await assert.rejects(updateCommunityPost({postId:12, ...payload}));
  }
  assert.equal(requests.length, count, "Invalid changes must not send requests");

  response = {
    postId:12, content:"게시물 내용입니다.", tag:"cardigan", tagLabel:"가디건",
    imageUrl:null, region:{shortName:"서대문구 신촌동"},
    createdAtDisplay:"1시간 전", modifiedAt:"2026-11-03T11:00:00+09:00",
    likeCount:20, isLiked:false, isMine:true,
  };
  const { deleteImage } = await server.ssrLoadModule("community-cache-entry");
  const cached = await deleteImage({...response, imageUrl:"https://example.com/old.png", image:"https://example.com/old.png"});
  assert.equal(cached.mine.image, null);
  assert.equal(cached.mine.imageUrl, null);
  assert.equal(cached.detail.imageUrl, null);
  assert.equal(cached.mine.modifiedAt, response.modifiedAt);
  assert.equal(cached.mine.isMine, true);
  assert.equal(cached.mine.likes, 20);

  const errorData = {removeImage:["이미지 삭제와 새 이미지 등록은 동시에 요청할 수 없습니다."]};
  api.defaults.adapter = async () => { throw {response:{status:400, data:errorData}}; };
  await assert.rejects(updateCommunityPost({postId:12, removeImage:true}), (error) =>
    error.response.status === 400 && error.response.data.removeImage[0] === errorData.removeImage[0]);
  process.stdout.write("Community PATCH checks passed (13 scenarios, including image deletion cache and field errors; no network requests).\n");
} finally {
  if (previousStorage === undefined) delete globalThis.localStorage;
  else globalThis.localStorage = previousStorage;
  await server.close();
}
