import { useParams } from "react-router-dom";
import BottomCTA from "../../components/BottomCTA";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import PageLayout from "../../components/PageLayout";
import PostDetailContent from "../../components/PostDetailContent";
import PostOwnerActions from "../../components/PostOwnerActions";
import { useMyPostQuery } from "../../hooks/useActivity";

export default function MyPostDetailPage() {
  const { postId } = useParams();
  const postQuery = useMyPostQuery(postId);
  const post = postQuery.data;

  return (
    <MobileLayout>
      <PageLayout nav={false} className="!px-0 !pb-0">
        <main className="mx-auto min-h-[max(852px,100dvh)] w-full max-w-[390px] px-6 pt-[73px] pb-[200px] text-[#353331]">
          <Header back />
          <h1 className="sr-only">작성한 게시물</h1>

          {postQuery.isLoading && (
            <p className="mt-8 text-center text-sm text-[#A5A4A3]">
              게시물을 불러오는 중이에요.
            </p>
          )}
          {(postQuery.isError || (!postQuery.isLoading && !post)) && (
            <p className="mt-8 text-center text-sm text-[#A5A4A3]">
              게시물을 찾을 수 없어요.
            </p>
          )}

          {post && <PostDetailContent post={post} layout="community" />}
        </main>

        {post?.isMine === true && !postQuery.isError && (
          <BottomCTA bottomClassName="bottom-[124px]">
            <PostOwnerActions post={post} postId={postId} />
          </BottomCTA>
        )}
      </PageLayout>
    </MobileLayout>
  );
}
