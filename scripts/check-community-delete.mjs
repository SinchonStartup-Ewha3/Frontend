/* global process */
import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true, watch: null },
  plugins: [{
    name: "community-delete-check",
    resolveId(source) {
      if (source === "community-delete-entry") return "\0community-delete-entry";
    },
    load(id) {
      if (id !== "\0community-delete-entry") return;
      return `
        import React from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
        import { useDeleteMyPost } from '/src/hooks/useActivity.js';
        import keys from '/src/api/queryKeys.js';
        export function setup() {
          const client = new QueryClient();
          const detailKeys = [keys.myPost('12'), keys.communityPost('12')];
          const listKeys = [keys.myPostsPage(1,10), keys.likedPostsPage(1,10), keys.communityPostsPage('all',1,10)];
          for (const key of detailKeys) client.setQueryData(key, {postId:12,isMine:true});
          for (const key of listKeys) client.setQueryData(key, {count:1,results:[{postId:12}]});
          client.setQueryData(keys.communityPost('13'), {postId:13});
          let deletion;
          function Probe() { deletion = useDeleteMyPost(); return null; }
          renderToStaticMarkup(React.createElement(QueryClientProvider, {client}, React.createElement(Probe)));
          return {client, detailKeys, listKeys, run:() => deletion.mutateAsync('12'), otherKey:keys.communityPost('13')};
        }
      `;
    },
  }],
});
const previousStorage = globalThis.localStorage;
let token = "test-access-token";
globalThis.localStorage = {getItem:(key) => key === "wee_access_token" ? token : null};

try {
  const {default:api} = await server.ssrLoadModule("/src/api/axios.js");
  const {deleteMyPost} = await server.ssrLoadModule("/src/api/activity.js");
  const requests = [];
  api.defaults.adapter = async config => {
    requests.push(config);
    return {data:"", status:204, statusText:"No Content", headers:{}, config};
  };
  assert.equal(await deleteMyPost('12'), undefined);
  assert.equal(requests[0].method, "delete");
  assert.equal(requests[0].url, "/api/community/posts/12/");
  assert.equal(requests[0].data, undefined);
  assert.equal(requests[0].headers.get("Authorization"), "Bearer test-access-token");

  const {setup} = await server.ssrLoadModule("community-delete-entry");
  let state = setup();
  await state.run();
  for (const key of state.detailKeys) assert.equal(state.client.getQueryData(key), undefined);
  for (const key of state.listKeys) assert.equal(state.client.getQueryState(key).isInvalidated, true);
  assert.equal(state.client.getQueryData(state.otherKey).postId, 13);
  state.client.clear();

  for (const status of [401,403,404]) {
    token = status === 401 ? null : "test-access-token";
    let attempts = 0;
    const detail = status === 403 ? "게시글 작성자만 수정할 수 있습니다." : "요청 실패";
    api.defaults.adapter = async config => {
      attempts += 1;
      throw {config, response:{status, data:{detail}}};
    };
    state = setup();
    await assert.rejects(state.run(), error => error.response.status === status && error.response.data.detail === detail);
    assert.equal(attempts, 1, "Deletion must not retry on failure");
    for (const key of state.detailKeys) assert.equal(state.client.getQueryData(key).postId, 12);
    for (const key of state.listKeys) assert.equal(state.client.getQueryState(key).isInvalidated, false);
    state.client.clear();
  }
  process.stdout.write("Community DELETE checks passed (5 scenarios; no network requests or real deletions).\n");
} finally {
  if (previousStorage === undefined) delete globalThis.localStorage;
  else globalThis.localStorage = previousStorage;
  await server.close();
}
