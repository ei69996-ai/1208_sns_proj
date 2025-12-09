"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Heart } from "lucide-react";

/**
 * @file LikeButton.tsx
 * @description 좋아요 버튼 컴포넌트
 *
 * Instagram 스타일의 좋아요 버튼
 * - 빈 하트 ↔ 빨간 하트 상태 관리
 * - 클릭 시 API 호출
 * - 클릭 애니메이션 (scale 1.3 → 1)
 * - 로딩 상태 관리 및 에러 처리
 */

interface LikeButtonProps {
  postId: string;
  isLiked: boolean;
  likesCount: number;
  onToggle?: (newIsLiked: boolean, newCount: number) => void; // 옵셔널 콜백
}

export interface LikeButtonRef {
  triggerLike: () => void;
}

export const LikeButton = forwardRef<LikeButtonRef, LikeButtonProps>(
  function LikeButton(
    {
      postId,
      isLiked: initialIsLiked,
      likesCount: initialLikesCount,
      onToggle,
    },
    ref
  ) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async () => {
    // 중복 클릭 방지
    if (isLoading) return;

    // Optimistic update: UI 즉시 반영
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);
    setIsLoading(true);
    setIsAnimating(true);

    // 애니메이션 완료 후 상태 리셋
    setTimeout(() => {
      setIsAnimating(false);
    }, 150);

    try {
      if (newIsLiked) {
        // 좋아요 추가
        const response = await fetch("/api/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId }),
        });

        if (!response.ok) {
          if (response.status === 409) {
            // 이미 좋아요한 경우 (UNIQUE 제약)
            // 상태는 이미 업데이트되었으므로 그대로 유지
            console.log("Already liked");
          } else if (response.status === 401) {
            // 인증 실패 - 상태 롤백
            setIsLiked(initialIsLiked);
            setLikesCount(initialLikesCount);
            alert("로그인이 필요합니다.");
          } else {
            // 기타 에러 - 상태 롤백
            setIsLiked(initialIsLiked);
            setLikesCount(initialLikesCount);
            throw new Error("Failed to like post");
          }
        } else {
          // 성공 시 콜백 호출
          if (onToggle) {
            onToggle(newIsLiked, newLikesCount);
          }
        }
      } else {
        // 좋아요 제거
        const response = await fetch(`/api/likes?postId=${postId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          if (response.status === 401) {
            // 인증 실패 - 상태 롤백
            setIsLiked(initialIsLiked);
            setLikesCount(initialLikesCount);
            alert("로그인이 필요합니다.");
          } else {
            // 기타 에러 - 상태 롤백
            setIsLiked(initialIsLiked);
            setLikesCount(initialLikesCount);
            throw new Error("Failed to unlike post");
          }
        } else {
          // 성공 시 콜백 호출
          if (onToggle) {
            onToggle(newIsLiked, newLikesCount);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // 에러 발생 시 상태 롤백
      setIsLiked(initialIsLiked);
      setLikesCount(initialLikesCount);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // ref를 통해 외부에서 좋아요 트리거 가능
  useImperativeHandle(ref, () => ({
    triggerLike: handleClick,
  }));

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        text-[var(--instagram-text-primary)] 
        hover:opacity-70 
        transition-transform 
        duration-150
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${isAnimating ? "scale-[1.3]" : "scale-100"}
      `}
      aria-label={isLiked ? "좋아요 취소" : "좋아요"}
    >
      <Heart
        className={`w-6 h-6 ${
          isLiked
            ? "fill-[var(--instagram-like)] text-[var(--instagram-like)]"
            : ""
        }`}
      />
    </button>
  );
});

