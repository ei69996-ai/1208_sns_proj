"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import type { PostWithUserAndStats, CommentWithUser } from "@/lib/types";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { LikeButton, type LikeButtonRef } from "./LikeButton";
import { CommentList } from "@/components/comment/CommentList";
import { CommentForm } from "@/components/comment/CommentForm";
import { PostModal } from "./PostModal";

/**
 * @file PostCard.tsx
 * @description 게시물 카드 컴포넌트
 *
 * Instagram 스타일의 게시물 카드
 * 헤더, 이미지, 액션 버튼, 컨텐츠 포함
 */

interface PostCardProps {
  post: PostWithUserAndStats;
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onCommentClick?: (postId: string) => void;
}

export function PostCard({ post, onLike, onCommentClick }: PostCardProps) {
  const { user } = useUser();
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [refreshComments, setRefreshComments] = useState(0); // 댓글 새로고침 트리거
  const [isModalOpen, setIsModalOpen] = useState(false);
  const likeButtonRef = useRef<LikeButtonRef>(null);

  // 캡션 줄 수 계산 (대략적으로)
  const captionLines = post.caption
    ? Math.ceil(post.caption.length / 40) // 대략 40자당 1줄
    : 0;
  const shouldShowMore = captionLines > 2;

  // 좋아요 토글 핸들러 (LikeButton의 onToggle 콜백)
  const handleLikeToggle = (newIsLiked: boolean, newCount: number) => {
    setIsLiked(newIsLiked);
    setLikesCount(newCount);
    if (onLike) {
      onLike(post.id);
    }
  };

  // 더블탭 좋아요 애니메이션
  useEffect(() => {
    if (showDoubleTapHeart) {
      const timer = setTimeout(() => {
        setShowDoubleTapHeart(false);
      }, 1000); // 1초 후 사라짐

      return () => clearTimeout(timer);
    }
  }, [showDoubleTapHeart]);

  // 더블탭 좋아요 (모바일)
  const [lastTap, setLastTap] = useState(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
      // 좋아요가 없을 때만 좋아요 추가
      if (!isLiked) {
        // LikeButton의 클릭을 트리거 (API 호출 포함)
        if (likeButtonRef.current) {
          likeButtonRef.current.triggerLike();
        }
        // 큰 하트 애니메이션 표시
        setShowDoubleTapHeart(true);
      }
    } else {
      setLastTap(now);
    }
  };

  return (
    <>
    <article className="bg-[var(--instagram-card)] border border-[var(--instagram-border)] rounded-lg mb-4 max-w-[630px] mx-auto">
      {/* 헤더 (60px) */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--instagram-border)]">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 (32px 원형) */}
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

        {/* ⋯ 메뉴 */}
        <button
          className="text-[var(--instagram-text-primary)] hover:opacity-70"
          aria-label="더보기"
        >
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </header>

      {/* 이미지 영역 (1:1 정사각형) */}
      <div
        className="relative aspect-square bg-gray-100 cursor-pointer"
        onDoubleClick={handleDoubleTap}
        onClick={() => setIsModalOpen(true)}
      >
        <Image
          src={post.image_url}
          alt={post.caption || "게시물 이미지"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 630px"
        />
        
        {/* 더블탭 좋아요 애니메이션 (큰 하트) */}
        {showDoubleTapHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={`
                w-20 h-20
                flex items-center justify-center
                animate-[fadeInOut_1s_ease-in-out]
              `}
            >
              <Heart
                className="w-20 h-20 fill-[var(--instagram-like)] text-[var(--instagram-like)]"
                strokeWidth={1.5}
              />
            </div>
          </div>
        )}
      </div>

      {/* 액션 버튼 (48px) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--instagram-border)]">
        <div className="flex items-center gap-4">
          {/* 좋아요 버튼 */}
          <LikeButton
            postId={post.id}
            isLiked={isLiked}
            likesCount={likesCount}
            onToggle={handleLikeToggle}
            ref={likeButtonRef}
          />

          {/* 댓글 버튼 */}
          <button
            onClick={() => {
              setIsModalOpen(true);
              onCommentClick?.(post.id);
            }}
            className="text-[var(--instagram-text-primary)] hover:opacity-70"
            aria-label="댓글"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          {/* 공유 버튼 (1차에서는 UI만) */}
          <button
            className="text-[var(--instagram-text-primary)] hover:opacity-70"
            aria-label="공유"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>

        {/* 북마크 버튼 (1차에서는 UI만) */}
        <button
          className="text-[var(--instagram-text-primary)] hover:opacity-70"
          aria-label="저장"
        >
          <Bookmark className="w-6 h-6" />
        </button>
      </div>

      {/* 컨텐츠 */}
      <div className="px-4 py-3 space-y-2">
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
            <span>
              {showFullCaption || !shouldShowMore
                ? post.caption
                : `${post.caption.slice(0, 80)}...`}
            </span>
            {shouldShowMore && !showFullCaption && (
              <button
                onClick={() => setShowFullCaption(true)}
                className="text-[var(--instagram-text-secondary)] hover:opacity-70 ml-1"
              >
                더 보기
              </button>
            )}
          </div>
        )}

        {/* 댓글 미리보기 */}
        {commentsCount > 0 && (
          <div className="space-y-1">
            {commentsCount > 2 && (
              <Link
                href={`/post/${post.id}`}
                className="text-sm text-[var(--instagram-text-secondary)] hover:opacity-70"
              >
                댓글 {commentsCount}개 모두 보기
              </Link>
            )}
            <CommentList
              key={refreshComments} // 새로고침 트리거
              postId={post.id}
              showLimit={2}
              currentUserId={user?.id}
              onDelete={() => {
                setCommentsCount((prev) => Math.max(0, prev - 1));
                setRefreshComments((prev) => prev + 1);
              }}
            />
          </div>
        )}

        {/* 시간 */}
        <div className="text-xs text-[var(--instagram-text-secondary)]">
          {formatTimeAgo(post.created_at)}
        </div>
      </div>

      {/* 댓글 입력 폼 */}
      <CommentForm
        postId={post.id}
        onSubmit={(newComment) => {
          setCommentsCount((prev) => prev + 1);
          setRefreshComments((prev) => prev + 1);
        }}
      />
    </article>

    {/* 게시물 상세 모달 */}
    <PostModal
      postId={isModalOpen ? post.id : null}
      onClose={() => setIsModalOpen(false)}
      initialPost={post}
    />
    </>
  );
}

/**
 * 상대 시간 포맷팅 (예: "3시간 전")
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "방금 전";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}주 전`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}개월 전`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}년 전`;
}

