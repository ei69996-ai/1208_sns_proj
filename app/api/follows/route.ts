import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * @file route.ts
 * @description 팔로우 추가 및 제거 API
 *
 * POST /api/follows: 팔로우 추가
 * DELETE /api/follows?followingId={followingId}: 팔로우 제거
 */

/**
 * POST /api/follows
 * 팔로우 추가
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 요청 본문에서 followingId 추출 (Clerk user ID)
    const body = await request.json();
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json(
        { error: "followingId is required" },
        { status: 400 }
      );
    }

    // 자기 자신 팔로우 방지
    if (clerkUserId === followingId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const supabase = await createClerkSupabaseClient();

    // Clerk user ID를 Supabase user ID로 변환 (follower)
    const { data: followerData, error: followerError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (followerError || !followerData) {
      console.error("Error fetching follower user:", followerError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Clerk user ID를 Supabase user ID로 변환 (following)
    const { data: followingData, error: followingError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", followingId)
      .single();

    if (followingError || !followingData) {
      console.error("Error fetching following user:", followingError);
      return NextResponse.json(
        { error: "User to follow not found" },
        { status: 404 }
      );
    }

    // 팔로우 추가
    const { data: followData, error: followError } = await supabase
      .from("follows")
      .insert({
        follower_id: followerData.id,
        following_id: followingData.id,
      })
      .select()
      .single();

    // UNIQUE 제약 위반 (이미 팔로우 중인 경우)
    if (followError) {
      if (followError.code === "23505") {
        // PostgreSQL unique violation
        return NextResponse.json(
          { error: "Already following" },
          { status: 409 }
        );
      }

      console.error("Error creating follow:", followError);
      return NextResponse.json(
        { error: "Failed to create follow" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      follow: followData,
    });
  } catch (error) {
    console.error("Error in POST /api/follows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/follows?followingId={followingId}
 * 팔로우 제거
 */
export async function DELETE(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 쿼리 파라미터에서 followingId 추출 (Clerk user ID)
    const searchParams = request.nextUrl.searchParams;
    const followingId = searchParams.get("followingId");

    if (!followingId) {
      return NextResponse.json(
        { error: "followingId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClerkSupabaseClient();

    // Clerk user ID를 Supabase user ID로 변환 (follower)
    const { data: followerData, error: followerError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (followerError || !followerData) {
      console.error("Error fetching follower user:", followerError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Clerk user ID를 Supabase user ID로 변환 (following)
    const { data: followingData, error: followingError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", followingId)
      .single();

    if (followingError || !followingData) {
      console.error("Error fetching following user:", followingError);
      return NextResponse.json(
        { error: "User to unfollow not found" },
        { status: 404 }
      );
    }

    // 팔로우 제거
    const { error: deleteError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerData.id)
      .eq("following_id", followingData.id);

    if (deleteError) {
      console.error("Error deleting follow:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete follow" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in DELETE /api/follows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

