import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { PostWithUserAndStats } from "@/lib/types";

/**
 * @file route.ts
 * @description 게시물 단일 조회 API
 *
 * GET /api/posts/[postId]
 * - 게시물 단일 조회
 * - 좋아요 수, 댓글 수 통계 조회
 * - 현재 사용자의 좋아요 상태 확인
 */

/**
 * GET /api/posts/[postId]
 * 게시물 단일 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth();
    const { postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClerkSupabaseClient();

    // 게시물 조회 (users 테이블과 조인)
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(
        `
        *,
        user:users!posts_user_id_fkey(
          id,
          clerk_id,
          name,
          created_at
        )
      `
      )
      .eq("id", postId)
      .single();

    if (postError || !post) {
      console.error("Error fetching post:", postError);
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // 좋아요 수 조회
    const { count: likesCount } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post.id);

    // 댓글 수 조회
    const { count: commentsCount } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post.id);

    // 현재 사용자의 좋아요 상태 확인
    let isLiked = false;
    if (userId) {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (userData) {
        const { data: likeData } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", userData.id)
          .single();

        isLiked = !!likeData;
      }
    }

    const postWithStats: PostWithUserAndStats = {
      ...post,
      likes_count: likesCount || 0,
      comments_count: commentsCount || 0,
      is_liked: isLiked,
    };

    return NextResponse.json({
      data: postWithStats,
    });
  } catch (error) {
    console.error("Error in GET /api/posts/[postId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

