import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import PageHeading from "../../components/PageHeading";
import PageLayout from "../../components/PageLayout";
import PostListItem from "../../components/PostListItem";
import {
  useMyPostsQuery,
  useSavedPostsQuery,
  useUnsavePost,
} from "../../hooks/useActivity";

export default function MyActivityPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSaved = searchParams.get("type") === "saved";
  const myPostsQuery = useMyPostsQuery();
  const savedPostsQuery = useSavedPostsQuery();
  const unsavePost = useUnsavePost();
  const postsQuery = isSaved ? savedPostsQuery : myPostsQuery;
  const posts = postsQuery.data ?? [];

  return (
    <MobileLayout>
      <PageLayout nav={false} className="!px-0 !pb-0">
        <main className="min-h-screen px-[26px] pt-[73px] text-[#353331]">
          <Header back />
          <PageHeading
            title={isSaved ? "저장한 게시물" : "작성한 게시물"}
            className="mt-[18px]"
            titleClassName="!text-[24px] !leading-[1.4] !tracking-[-0.72px]"
          />

          <section
            aria-label={isSaved ? "저장한 게시물 목록" : "작성한 게시물 목록"}
            className="mt-[18px]"
          >
            {posts.map((post) => (
              <PostListItem
                key={post.id}
                post={post}
                heartActive={isSaved}
                onClick={isSaved ? undefined : () => navigate(`/mypage/activity/${post.id}`)}
                onHeartClick={
                  isSaved ? () => unsavePost.mutate(post.id) : undefined
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
                {isSaved ? "저장한 게시물이 없어요." : "작성한 게시물이 없어요."}
              </p>
            )}
          </section>
        </main>
      </PageLayout>
    </MobileLayout>
  );
}
