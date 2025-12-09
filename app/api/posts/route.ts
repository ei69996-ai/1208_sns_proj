import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { PostWithUserAndStats } from "@/lib/types";

/**
 * @file route.ts
 * @description 게시물 목록 조회 및 생성 API
 *
 * GET /api/posts
 * - 시간 역순 정렬
 * - 페이지네이션 지원 (limit, offset)
 * - userId 파라미터 지원 (프로필 페이지용)
 *
 * POST /api/posts
 * - 게시물 생성
 * - 이미지 파일 업로드 (Supabase Storage)
 * - 캡션 입력 (최대 2,200자)
 */

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    // 인증 확인 (선택사항 - 공개 피드의 경우 인증 불필요할 수도 있음)
    // if (!userId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const supabase = await createClerkSupabaseClient();

    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const userIdParam = searchParams.get("userId");

    // 기본 쿼리: posts 테이블과 users 테이블 조인
    let query = supabase
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
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // userId 필터 (프로필 페이지용)
    if (userIdParam) {
      // 먼저 clerk_id로 users 테이블에서 user_id 찾기
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userIdParam)
        .single();

      if (userData) {
        query = query.eq("user_id", userData.id);
      } else {
        // 사용자를 찾을 수 없으면 빈 배열 반환
        return NextResponse.json({
          data: [],
          meta: {
            total: 0,
            limit,
            offset,
            hasMore: false,
          },
        });
      }
    }

    // 게시물 조회
    const { data: posts, error: postsError } = await query;

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    // 각 게시물에 대한 통계 정보 조회 (likes_count, comments_count)
    const postsWithStats: PostWithUserAndStats[] = await Promise.all(
      (posts || []).map(async (post) => {
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

        return {
          ...post,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0,
          is_liked: isLiked,
        } as PostWithUserAndStats;
      })
    );

    // 전체 게시물 수 조회 (페이지네이션용)
    let countQuery = supabase.from("posts").select("*", { count: "exact", head: true });
    if (userIdParam) {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userIdParam)
        .single();

      if (userData) {
        countQuery = countQuery.eq("user_id", userData.id);
      }
    }
    const { count: total } = await countQuery;

    return NextResponse.json({
      data: postsWithStats,
      meta: {
        total: total || 0,
        limit,
        offset,
        hasMore: (total || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts
 * 게시물 생성
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

    const supabase = await createClerkSupabaseClient();

    // FormData 파싱
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const caption = formData.get("caption") as string | null;

    // 이미지 파일 검증
    if (!imageFile) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (최대 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 5MB (current: ${(imageFile.size / 1024 / 1024).toFixed(2)}MB)` },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // 캡션 길이 검증 (최대 2,200자)
    const MAX_CAPTION_LENGTH = 2200;
    if (caption && caption.length > MAX_CAPTION_LENGTH) {
      return NextResponse.json(
        { error: `Caption exceeds ${MAX_CAPTION_LENGTH} characters` },
        { status: 400 }
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
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 파일명 생성
    const fileExt = imageFile.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${clerkUserId}/${fileName}`;

    // Storage 버킷 이름 (환경 변수 또는 기본값)
    const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads";

    // Supabase Storage 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image", details: uploadError.message },
        { status: 500 }
      );
    }

    // 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: "Failed to get public URL" },
        { status: 500 }
      );
    }

    // posts 테이블에 데이터 저장
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: userData.id,
        image_url: urlData.publicUrl,
        caption: caption?.trim() || null,
      })
      .select()
      .single();

    if (postError) {
      console.error("Error creating post:", postError);
      // 업로드된 파일 삭제 시도 (실패해도 계속 진행)
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      return NextResponse.json(
        { error: "Failed to create post", details: postError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post: postData,
    });
  } catch (error) {
    console.error("Error in POST /api/posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

