import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { PostWithUserAndStats } from "@/lib/types";

/**
 * @file route.ts
 * @description 게시물 단일 조회 및 삭제 API
 *
 * GET /api/posts/[postId]
 * - 게시물 단일 조회
 * - 좋아요 수, 댓글 수 통계 조회
 * - 현재 사용자의 좋아요 상태 확인
 *
 * DELETE /api/posts/[postId]
 * - 게시물 삭제
 * - 본인만 삭제 가능
 * - Supabase Storage에서 이미지 삭제
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
        { error: "게시물 ID가 필요합니다." },
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
        { error: "게시물을 찾을 수 없습니다." },
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
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[postId]
 * 게시물 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { error: "게시물 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClerkSupabaseClient();

    // 게시물 조회
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, user_id, image_url")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      console.error("Error fetching post:", postError);
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Clerk user ID를 Supabase user ID로 변환
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 본인 게시물인지 확인
    if (post.user_id !== userData.id) {
      return NextResponse.json(
        { error: "본인의 게시물만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // Supabase Storage에서 이미지 삭제
    // image_url에서 Storage 경로 추출
    // 예: https://xxx.supabase.co/storage/v1/object/public/posts/user_id/filename.jpg
    // 또는: https://xxx.supabase.co/storage/v1/object/sign/posts/user_id/filename.jpg
    const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "posts";
    
    try {
      // image_url에서 경로 추출
      // URL 형식: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
      const urlPattern = /\/storage\/v1\/object\/(?:public|sign)\/([^\/]+)\/(.+)$/;
      const match = post.image_url.match(urlPattern);
      
      if (match) {
        const bucket = match[1];
        const filePath = match[2];
        
        // Storage에서 파일 삭제
        const { error: storageError } = await supabase.storage
          .from(bucket)
          .remove([filePath]);

        if (storageError) {
          console.error("Error deleting image from Storage:", storageError);
          // Storage 삭제 실패해도 데이터베이스 삭제는 진행
        }
      } else {
        console.warn("Could not parse image URL:", post.image_url);
        // URL 파싱 실패해도 데이터베이스 삭제는 진행
      }
    } catch (storageError) {
      console.error("Error in Storage deletion:", storageError);
      // Storage 삭제 실패해도 데이터베이스 삭제는 진행
    }

    // posts 테이블에서 게시물 삭제 (CASCADE로 관련 데이터 자동 삭제)
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) {
      console.error("Error deleting post:", deleteError);
      return NextResponse.json(
        { error: "게시물 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in DELETE /api/posts/[postId]:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

