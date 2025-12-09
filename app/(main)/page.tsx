import { PostFeed } from "@/components/post/PostFeed";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * @file page.tsx
 * @description 홈 피드 페이지
 *
 * PostFeed 컴포넌트 통합
 * 배경색 #FAFAFA 설정
 * 최대 너비 630px, 중앙 정렬
 */

export default async function HomePage() {
  const { userId } = await auth();

  // 인증 확인 (선택사항 - 공개 피드의 경우 인증 불필요할 수도 있음)
  // if (!userId) {
  //   redirect("/sign-in");
  // }

  return (
    <div className="max-w-[630px] mx-auto py-4 px-4">
      <PostFeed />
    </div>
  );
}

