"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { PostWithUserAndStats } from "@/lib/types";
import { LikeButton, type LikeButtonRef } from "./LikeButton";
import { CommentList } from "@/components/comment/CommentList";
import { CommentForm } from "@/components/comment/CommentForm";

/**
 * @file PostModal.tsx
 * @description 게시물 상세 모달 컴포넌트
 *
 * Instagram 스타일의 게시물 상세 모달
 * - Desktop: 모달 형식 (이미지 50% + 댓글 50%)
 * - Mobile: 전체 화면 모달
 * - 댓글 전체 목록 및 작성 기능 포함
 */

interface PostModalProps {
  postId: string | null; // null이면 모달 닫힘
  onClose: () => void;
  initialPost?: PostWithUserAndStats; // 선택사항: 초기 데이터
}

export function PostModal({ postId, onClose, initialPost }: PostModalProps) {
  const { user } = useUser();
  const [post, setPost] = useState<PostWithUserAndStats | null>(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(initialPost?.is_liked || false);
  const [likesCount, setLikesCount] = useState(initialPost?.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(initialPost?.comments_count || 0);
  const [refreshComments, setRefreshComments] = useState(0);
  const likeButtonRef = useRef<LikeButtonRef | null>(null);

  // 게시물 상세 정보 로드
  useEffect(() => {
    if (!postId) {
      setPost(null);
      setLoading(false);
      return;
    }

    // 초기 데이터가 있으면 사용
    if (initialPost && initialPost.id === postId) {
      setPost(initialPost);
      setLoading(false);
      return;
    }

    // API에서 게시물 정보 로드
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }

        const result = await response.json();
        const postData = result.data as PostWithUserAndStats;

        setPost(postData);
        setIsLiked(postData.is_liked || false);
        setLikesCount(postData.likes_count || 0);
        setCommentsCount(postData.comments_count || 0);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("게시물을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, initialPost]);

  // 좋아요 토글 핸들러
  const handleLikeToggle = (newIsLiked: boolean, newCount: number) => {
    setIsLiked(newIsLiked);
    setLikesCount(newCount);
  };

  // 댓글 작성 후 콜백
  const handleCommentSubmit = () => {
    setCommentsCount((prev) => prev + 1);
    setRefreshComments((prev) => prev + 1);
  };

  // 댓글 삭제 후 콜백
  const handleCommentDelete = () => {
    setCommentsCount((prev) => Math.max(0, prev - 1));
    setRefreshComments((prev) => prev + 1);
  };

  // 모달이 닫힐 때 상태 초기화
  const handleClose = () => {
    setPost(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  if (!postId) {
    return null;
  }

  return (
    <Dialog open={!!postId} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden md:flex md:flex-row">
        {/* 로딩 상태 */}
        {loading && (
          <div className="flex items-center justify-center w-full h-[500px]">
            <div className="text-[var(--instagram-text-secondary)]">로딩 중...</div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="flex items-center justify-center w-full h-[500px]">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        {/* 게시물 내용 */}
        {post && !loading && !error && (
          <>
            {/* 이미지 영역 (Desktop: 50%, Mobile: 전체) */}
            <div className="relative w-full md:w-1/2 h-[400px] md:h-auto bg-black flex items-center justify-center">
              <Image
                src={post.image_url}
                alt={post.caption || "게시물 이미지"}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* 댓글 영역 (Desktop: 50%, Mobile: 전체) */}
            <div className="w-full md:w-1/2 flex flex-col h-[400px] md:h-auto max-h-[90vh]">
              {/* 헤더 */}
              <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--instagram-border)] flex-shrink-0">
                <div className="flex items-center gap-3">
                  {/* 프로필 이미지 */}
                  <Link
                    href={`/profile/${post.user.clerk_id}`}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden hover:opacity-70"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm">
                      {post.user.name.charAt(0).toUpperCase()}
                    </div>
                  </Link>

                  {/* 사용자명 */}
                  <Link
                    href={`/profile/${post.user.clerk_id}`}
                    className="font-semibold text-[var(--instagram-text-primary)] hover:opacity-70"
                  >
                    {post.user.name}
                  </Link>
                </div>

                {/* 더보기 버튼 */}
                <button
                  className="text-[var(--instagram-text-primary)] hover:opacity-70"
                  aria-label="더보기"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              </header>

              {/* 댓글 목록 (스크롤 가능) */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {/* 액션 버튼 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <LikeButton
                      ref={likeButtonRef}
                      postId={post.id}
                      isLiked={isLiked}
                      likesCount={likesCount}
                      onToggle={handleLikeToggle}
                    />

                    {/* 댓글 버튼 */}
                    <button
                      className="text-[var(--instagram-text-primary)] hover:opacity-70"
                      aria-label="댓글"
                    >
                      <MessageCircle className="w-6 h-6" />
                    </button>

                    {/* 공유 버튼 */}
                    <button
                      className="text-[var(--instagram-text-primary)] hover:opacity-70"
                      aria-label="공유"
                    >
                      <Send className="w-6 h-6" />
                    </button>
                  </div>

                  {/* 북마크 버튼 */}
                  <button
                    className="text-[var(--instagram-text-primary)] hover:opacity-70"
                    aria-label="저장"
                  >
                    <Bookmark className="w-6 h-6" />
                  </button>
                </div>

                {/* 좋아요 수 */}
                {likesCount > 0 && (
                  <div className="font-semibold text-[var(--instagram-text-primary)]">
                    좋아요 {likesCount.toLocaleString()}개
                  </div>
                )}

                {/* 캡션 */}
                {post.caption && (
                  <div className="text-sm text-[var(--instagram-text-primary)]">
                    <Link
                      href={`/profile/${post.user.clerk_id}`}
                      className="font-semibold hover:opacity-70 mr-2"
                    >
                      {post.user.name}
                    </Link>
                    <span>{post.caption}</span>
                  </div>
                )}

                {/* 댓글 목록 */}
                <CommentList
                  key={refreshComments}
                  postId={post.id}
                  currentUserId={user?.id}
                  onDelete={handleCommentDelete}
                />
              </div>

              {/* 댓글 작성 폼 */}
              <div className="flex-shrink-0 border-t border-[var(--instagram-border)]">
                <CommentForm postId={post.id} onSubmit={handleCommentSubmit} />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

