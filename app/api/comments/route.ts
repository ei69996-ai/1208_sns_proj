import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { CommentWithUser } from "@/lib/types";

/**
 * @file route.ts
 * @description 댓글 조회, 작성, 삭제 API
 *
 * GET /api/comments?postId={postId}: 댓글 목록 조회
 * POST /api/comments: 댓글 작성
 * DELETE /api/comments?commentId={commentId}: 댓글 삭제
 */

/**
 * GET /api/comments?postId={postId}
 * 댓글 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClerkSupabaseClient();

    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get("postId");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    if (!postId) {
      return NextResponse.json(
        { error: "게시물 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 기본 쿼리: comments 테이블과 users 테이블 조인
    let query = supabase
      .from("comments")
      .select(
        `
        *,
        user:users!comments_user_id_fkey(
          id,
          clerk_id,
          name,
          created_at
        )
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true }); // 오름차순 (최신 댓글이 아래)

    // limit과 offset 적용 (선택사항)
    if (limit) {
      const limitNum = parseInt(limit, 10);
      const offsetNum = offset ? parseInt(offset, 10) : 0;
      query = query.range(offsetNum, offsetNum + limitNum - 1);
    }

    const { data: comments, error: commentsError } = await query;

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      return NextResponse.json(
        { error: "댓글을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: (comments || []) as CommentWithUser[],
    });
  } catch (error) {
    console.error("Error in GET /api/comments:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/comments
 * 댓글 작성
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { postId, content } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "게시물 ID가 필요합니다." },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "댓글 내용을 입력해주세요." },
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
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 댓글 작성
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userData.id,
        content: content.trim(),
      })
      .select(
        `
        *,
        user:users!comments_user_id_fkey(
          id,
          clerk_id,
          name,
          created_at
        )
      `
      )
      .single();

    if (commentError) {
      console.error("Error creating comment:", commentError);
      return NextResponse.json(
        { error: "댓글 작성에 실패했습니다.", details: commentError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comment: commentData as CommentWithUser,
    });
  } catch (error) {
    console.error("Error in POST /api/comments:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/comments?commentId={commentId}
 * 댓글 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        { error: "댓글 ID가 필요합니다." },
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
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 댓글 작성자 확인
    const { data: commentData, error: commentFetchError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (commentFetchError || !commentData) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // 본인 댓글인지 확인
    if (commentData.user_id !== userData.id) {
      return NextResponse.json(
        { error: "본인의 댓글만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      console.error("Error deleting comment:", deleteError);
      return NextResponse.json(
        { error: "댓글 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in DELETE /api/comments:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

