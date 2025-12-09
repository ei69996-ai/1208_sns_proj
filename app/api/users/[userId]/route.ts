import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { UserWithStats } from "@/lib/types";

/**
 * @file route.ts
 * @description 사용자 정보 조회 API
 *
 * GET /api/users/[userId]
 * - 사용자 정보 및 통계 조회
 * - user_stats 뷰 활용
 * - 현재 사용자의 팔로우 상태 확인
 */

/**
 * GET /api/users/[userId]
 * 사용자 정보 및 통계 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: currentUserId } = await auth();
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClerkSupabaseClient();

    // user_stats 뷰에서 사용자 정보 및 통계 조회
    const { data: userStats, error: userStatsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("clerk_id", userId)
      .single();

    if (userStatsError || !userStats) {
      console.error("Error fetching user stats:", userStatsError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // users 테이블에서 추가 정보 조회 (created_at 등)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, clerk_id, name, created_at")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 현재 사용자의 팔로우 상태 확인
    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      // 현재 사용자의 Supabase user ID 찾기
      const { data: currentUserData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", currentUserId)
        .single();

      if (currentUserData) {
        // 팔로우 관계 확인
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

    return NextResponse.json({
      data: userWithStats,
    });
  } catch (error) {
    console.error("Error in GET /api/users/[userId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

