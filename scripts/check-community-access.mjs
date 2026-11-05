/* global process */
import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true, watch: null },
  plugins: [{
    name: "community-access-check",
    enforce: "pre",
    resolveId(source) {
      if (source === "community-access-entry") return "\0community-access-entry";
      if (source.endsWith("/hooks/useImagePicker")) return "\0unused-image-picker";
    },
    load(id) {
      // Image conversion needs browser workers and is outside these access checks.
      if (id === "\0unused-image-picker") return "export default () => ({photo:null, preview:null, isProcessing:false});";
      if (id !== "\0community-access-entry") return;
      return `
        import React from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import { MemoryRouter, Routes, Route } from 'react-router-dom';
        import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
        import MyDetail from '/src/pages/mypage/MyPostDetailPage.jsx';
        import Detail from '/src/pages/community/CommunityPostDetailPage.jsx';
        import Edit from '/src/pages/community/CommunityEditPage.jsx';
        import keys from '/src/api/queryKeys.js';
        export function render(view, post) {
          const client = new QueryClient({defaultOptions:{queries:{retry:false}}});
          client.setQueryData(keys.myPost('12'), post);
          client.setQueryData(keys.communityPost('12'), post);
          const Page = {mine:MyDetail, detail:Detail, edit:Edit}[view];
          return renderToStaticMarkup(React.createElement(QueryClientProvider, {client},
            React.createElement(MemoryRouter, {initialEntries:['/12']},
              React.createElement(Routes, null, React.createElement(Route, {
                path:'/:postId', element:React.createElement(Page)
              })))));
        }
      `;
    },
  }],
});

const post = {
  postId: 12, content: "가디건을 챙겨주세요", message: "가디건을 챙겨주세요",
  tag: "cardigan", tagLabel: "가디건", imageUrl: null,
  region: {shortName: "서대문구 신촌동"}, createdAtDisplay: "1시간 전",
  likeCount: 20, isLiked: true,
};

try {
  const { render } = await server.ssrLoadModule("community-access-entry");
  for (const view of ["mine", "detail"]) {
    const owner = render(view, {...post, isMine:true});
    assert.match(owner, />수정하기</);
    assert.match(owner, />삭제하기</);
    for (const access of [false, undefined]) {
      const reader = render(view, {...post, isMine:access});
      assert.doesNotMatch(reader, />수정하기<|>삭제하기</);
      assert.match(reader, /가디건을 챙겨주세요/);
      assert.match(reader, /서대문구 신촌동/);
    }
    const noRegion = render(view, {...post, region:null, isMine:false});
    assert.match(noRegion, /가디건을 챙겨주세요/);
  }
  assert.match(render("edit", {...post, isMine:true}), /textarea/);
  for (const access of [false, undefined]) {
    const reader = render("edit", {...post, isMine:access});
    assert.doesNotMatch(reader, /textarea/);
    assert.match(reader, /게시글 작성자만 수정할 수 있습니다/);
  }
  process.stdout.write("Community access checks passed (11 scenarios).\n");
} finally {
  await server.close();
}
