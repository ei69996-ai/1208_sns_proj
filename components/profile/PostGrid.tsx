"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import type { PostWithUserAndStats } from "@/lib/types";
import { PostModal } from "@/components/post/PostModal";

/**
 * @file PostGrid.tsx
 * @description 프로필 페이지 게시물 그리드 컴포넌트
 *
 * Instagram 스타일의 게시물 그리드
 * - 3열 그리드 레이아웃 (반응형)
 * - 1:1 정사각형 썸네일
 * - Hover 시 좋아요/댓글 수 표시
 * - 클릭 시 게시물 상세 모달 열기
 */

interface PostGridProps {
  userId: string; // Clerk user ID
  onPostClick?: (postId: string) => void; // 게시물 클릭 콜백
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

export function PostGrid({ userId, onPostClick }: PostGridProps) {
  const [posts, setPosts] = useState<PostWithUserAndStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostWithUserAndStats | null>(null);

  // 게시물 목록 조회
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `/api/posts?limit=100&offset=0&userId=${userId}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const result: PostsResponse = await response.json();
        setPosts(result.data || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("게시물을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  // 게시물 클릭 핸들러
  const handlePostClick = (post: PostWithUserAndStats) => {
    setSelectedPost(post);
    setSelectedPostId(post.id);
    if (onPostClick) {
      onPostClick(post.id);
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setSelectedPostId(null);
    setSelectedPost(null);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1 md:gap-1">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  // 게시물이 없을 때
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--instagram-text-secondary)]">
        <p className="text-lg mb-2">게시물이 없습니다</p>
        <p className="text-sm">첫 번째 게시물을 작성해보세요!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:gap-1">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative aspect-square bg-gray-100 cursor-pointer group"
            onClick={() => handlePostClick(post)}
          >
            {/* 썸네일 이미지 */}
            <Image
              src={post.image_url}
              alt={post.caption || "게시물 이미지"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 300px"
            />

            {/* Hover 오버레이 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
              <div className="flex items-center gap-1">
                <Heart className="w-5 h-5 fill-white" />
                <span className="font-semibold">
                  {post.likes_count.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-5 h-5 fill-white" />
                <span className="font-semibold">
                  {post.comments_count.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 게시물 상세 모달 */}
      {selectedPostId && selectedPost && (
        <PostModal
          postId={selectedPostId}
          onClose={handleCloseModal}
          initialPost={selectedPost}
        />
      )}
    </>
  );
}

