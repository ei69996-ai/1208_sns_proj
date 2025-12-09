import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * @file route.ts
 * @description 좋아요 추가/제거 API
 *
 * POST /api/likes: 좋아요 추가
 * DELETE /api/likes?postId={postId}: 좋아요 제거
 */

/**
 * POST /api/likes
 * 좋아요 추가
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

    // 요청 본문에서 postId 추출
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClerkSupabaseClient();

    // Clerk user ID를 Supabase user ID로 변환
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 좋아요 추가
    const { data: likeData, error: likeError } = await supabase
      .from("likes")
      .insert({
        post_id: postId,
        user_id: userData.id,
      })
      .select()
      .single();

    // UNIQUE 제약 위반 (이미 좋아요한 경우)
    if (likeError) {
      if (likeError.code === "23505") {
        // PostgreSQL unique violation
        return NextResponse.json(
          { error: "Already liked" },
          { status: 409 }
        );
      }

      console.error("Error creating like:", likeError);
      return NextResponse.json(
        { error: "Failed to create like" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      like: likeData,
    });
  } catch (error) {
    console.error("Error in POST /api/likes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/likes?postId={postId}
 * 좋아요 제거
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

    // 쿼리 파라미터에서 postId 추출
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClerkSupabaseClient();

    // Clerk user ID를 Supabase user ID로 변환
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 좋아요 제거
    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userData.id);

    if (deleteError) {
      console.error("Error deleting like:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete like" },
        { status: 500 }
      );
    }

    // 삭제된 레코드가 있는지 확인 (실제로 좋아요가 있었는지)
    // Supabase는 삭제된 행이 없어도 에러를 반환하지 않으므로,
    // 별도로 확인하지 않고 성공으로 처리

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in DELETE /api/likes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

