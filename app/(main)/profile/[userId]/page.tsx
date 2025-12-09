import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { UserWithStats } from "@/lib/types";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostGrid } from "@/components/profile/PostGrid";

/**
 * @file page.tsx
 * @description 프로필 페이지
 *
 * 동적 라우트: /profile/[userId]
 * 사용자 정보 및 게시물 그리드 표시
 */

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId: paramUserId } = await params;
  const { userId: currentUserId } = await auth();

  const supabase = await createClerkSupabaseClient();

  // 사용자 정보 조회 (user_stats 뷰 활용)
  const { data: userStats, error: userStatsError } = await supabase
    .from("user_stats")
    .select("*")
    .eq("clerk_id", paramUserId)
    .single();

  if (userStatsError || !userStats) {
    notFound();
  }

  // users 테이블에서 추가 정보 조회
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id, clerk_id, name, created_at")
    .eq("clerk_id", paramUserId)
    .single();

  if (userError || !userData) {
    notFound();
  }

  // 현재 사용자의 팔로우 상태 확인
  let isFollowing = false;
  if (currentUserId && currentUserId !== paramUserId) {
    const { data: currentUserData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", currentUserId)
      .single();

    if (currentUserData) {
      const { data: followData } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUserData.id)
        .eq("following_id", userData.id)
        .single();

      isFollowing = !!followData;
    }
  }

  const userWithStats: UserWithStats & { is_following: boolean } = {
    id: userData.id,
    clerk_id: userData.clerk_id,
    name: userData.name,
    created_at: userData.created_at,
    posts_count: userStats.posts_count || 0,
    followers_count: userStats.followers_count || 0,
    following_count: userStats.following_count || 0,
    is_following: isFollowing,
  };

  return (
    <div className="max-w-[935px] mx-auto py-4 md:py-8 px-4">
      {/* 프로필 헤더 */}
      <ProfileHeader
        userId={paramUserId}
        currentUserId={currentUserId}
        initialData={userWithStats}
      />

      {/* 게시물 그리드 */}
      <div className="mt-8 md:mt-12">
        <PostGrid userId={paramUserId} />
      </div>
    </div>
  );
}

