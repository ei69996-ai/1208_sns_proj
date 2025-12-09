"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import type { PostWithUserAndStats } from "@/lib/types";
import { getApiErrorMessage, getNetworkErrorMessage, isNetworkError } from "@/lib/utils/error-handler";

/**
 * @file PostFeed.tsx
 * @description 게시물 피드 컴포넌트
 *
 * 무한 스크롤 및 페이지네이션 지원
 * Intersection Observer API 사용
 */

interface PostFeedProps {
  userId?: string; // 프로필 페이지용 (선택사항)
  initialPosts?: PostWithUserAndStats[];
}

interface PostsResponse {
  data: PostWithUserAndStats[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function PostFeed({ userId, initialPosts }: PostFeedProps) {
  const [posts, setPosts] = useState<PostWithUserAndStats[]>(initialPosts || []);
  const [loading, setLoading] = useState(!initialPosts);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialPosts?.length || 0);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 게시물 목록 가져오기
  const fetchPosts = useCallback(
    async (reset = false) => {
      // reset일 때는 loading 체크를 하지 않음 (강제 새로고침)
      if (!reset && loading) return;

      setLoading(true);
      setError(null); // 에러 상태 초기화
      try {
        const currentOffset = reset ? 0 : offset;
        const url = `/api/posts?limit=10&offset=${currentOffset}${
          userId ? `&userId=${userId}` : ""
        }`;

        const response = await fetch(url);
        if (!response.ok) {
          const errorMessage = await getApiErrorMessage(response);
          // API 응답에서 상세 에러 정보 추출 시도
          try {
            const errorData = await response.json();
            if (errorData.details) {
              console.error("API Error details:", errorData.details);
            }
          } catch {
            // JSON 파싱 실패 시 무시
          }
          throw new Error(errorMessage);
        }

        const result: PostsResponse = await response.json();

        if (reset) {
          setPosts(result.data);
        } else {
          setPosts((prev) => [...prev, ...result.data]);
        }

        setOffset(currentOffset + result.data.length);
        setHasMore(result.meta.hasMore);
        setError(null); // 성공 시 에러 상태 초기화
      } catch (error) {
        console.error("Error fetching posts:", error);
        const errorMessage = isNetworkError(error)
          ? getNetworkErrorMessage(error)
          : error instanceof Error
          ? error.message
          : "게시물을 불러오는데 실패했습니다.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [loading, offset, userId]
  );

  // 초기 로드
  useEffect(() => {
    if (!initialPosts) {
      fetchPosts(true);
    }
  }, []);

  // 게시물 생성 후 새로고침 이벤트 리스너
  useEffect(() => {
    const handlePostCreated = () => {
      fetchPosts(true);
    };

    window.addEventListener("post-created", handlePostCreated);

    return () => {
      window.removeEventListener("post-created", handlePostCreated);
    };
  }, [fetchPosts]);

  // 무한 스크롤: Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPosts();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, fetchPosts]);

  // 좋아요 핸들러
  // Note: LikeButton 컴포넌트가 직접 API를 호출하므로,
  // 이 핸들러는 호환성을 위해 유지하되 실제 동작은 LikeButton에서 처리됨
  const handleLike = (postId: string) => {
    // LikeButton이 직접 API를 호출하고 상태를 관리하므로
    // 여기서는 추가 작업이 필요하지 않음
    // 필요시 피드 상태를 업데이트할 수 있음
  };

  // 댓글 클릭 핸들러
  const handleCommentClick = (postId: string) => {
    // 댓글 모달 열기 (PostCard에서 처리됨)
  };

  // 게시물 삭제 핸들러
  const handleDelete = (postId: string) => {
    // 삭제된 게시물을 목록에서 제거
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    // offset도 조정 (선택사항)
    setOffset((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="space-y-4">
      {/* 게시물 목록 */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onCommentClick={handleCommentClick}
          onDelete={handleDelete}
        />
      ))}

      {/* 로딩 중 Skeleton */}
      {loading && (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      )}

      {/* 무한 스크롤 감지용 요소 */}
      {hasMore && !loading && (
        <div ref={observerTarget} className="h-4" aria-hidden="true" />
      )}

      {/* 더 이상 게시물이 없을 때 */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-[var(--instagram-text-secondary)] text-sm">
          모든 게시물을 불러왔습니다.
        </div>
      )}

      {/* 에러 상태 */}
      {error && !loading && (
        <div className="text-center py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-800 font-semibold mb-2">오류 발생</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchPosts(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* 게시물이 없을 때 */}
      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-16 text-[var(--instagram-text-secondary)]">
          <p className="text-lg mb-2">게시물이 없습니다</p>
          <p className="text-sm">첫 번째 게시물을 작성해보세요!</p>
        </div>
      )}
    </div>
  );
}

