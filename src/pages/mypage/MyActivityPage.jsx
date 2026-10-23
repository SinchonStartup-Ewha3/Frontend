import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import PageHeading from "../../components/PageHeading";
import PageLayout from "../../components/PageLayout";
import PostListItem from "../../components/PostListItem";
import {
  useMyPostsQuery,
  useLikedPostsQuery,
  useUnlikePost,
} from "../../hooks/useActivity";

export default function MyActivityPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isLiked = ["liked", "saved"].includes(searchParams.get("type"));
  const requestedPage = Number(searchParams.get("page") ?? 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = 10;
  const myPostsQuery = useMyPostsQuery(page, pageSize, !isLiked);
  const likedPostsQuery = useLikedPostsQuery(page, pageSize, isLiked);
  const unlikePost = useUnlikePost();
  const postsQuery = isLiked ? likedPostsQuery : myPostsQuery;
  const posts = postsQuery.data?.results ?? [];
  const pageCount = Math.ceil((postsQuery.data?.count ?? 0) / pageSize);

  const goToPage = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    if (nextPage === 1) params.delete("page");
    else params.set("page", String(nextPage));
    setSearchParams(params);
  };

  return (
    <MobileLayout>
      <PageLayout nav={false} className="!px-0 !pb-0">
        <main className="min-h-screen px-[26px] pt-[73px] text-[#353331]">
          <Header back />
          <PageHeading
            title={isLiked ? "공감한 게시물" : "작성한 게시물"}
            className="mt-[18px]"
            titleClassName="!text-[24px] !leading-[1.4] !tracking-[-0.72px]"
          />

          <section
            aria-label={isLiked ? "공감한 게시물 목록" : "작성한 게시물 목록"}
            className="mt-[18px]"
          >
            {posts.map((post) => (
              <PostListItem
                key={post.id}
                post={post}
                heartActive={isLiked || Boolean(post.isLiked)}
                onClick={isLiked ? undefined : () => navigate(`/mypage/activity/${post.id}`)}
                onHeartClick={
                  isLiked ? () => unlikePost.mutate(post.id) : undefined
                }
              />
            ))}

            {postsQuery.isLoading && (
              <p className="py-8 text-center text-sm text-[#A5A4A3]">
                게시물을 불러오는 중이에요.
              </p>
            )}
            {postsQuery.isError && (
              <p className="py-8 text-center text-sm text-[#A5A4A3]">
                게시물을 불러오지 못했어요.
              </p>
            )}
            {!postsQuery.isLoading && !postsQuery.isError && posts.length === 0 && (
              <p className="py-8 text-center text-sm text-[#A5A4A3]">
                {isLiked ? "공감한 게시물이 없어요." : "작성한 게시물이 없어요."}
              </p>
            )}
          </section>
          {!postsQuery.isError && pageCount > 1 && (
            <div className="flex items-center justify-center gap-5 py-3 text-sm font-medium text-[#797776]">
              <button
                type="button"
                disabled={page <= 1 || postsQuery.isFetching}
                onClick={() => goToPage(page - 1)}
                className="disabled:opacity-40"
              >
                이전
              </button>
              <span>{page} / {pageCount}</span>
              <button
                type="button"
                disabled={page >= pageCount || postsQuery.isFetching}
                onClick={() => goToPage(page + 1)}
                className="disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}
        </main>
      </PageLayout>
    </MobileLayout>
  );
}
