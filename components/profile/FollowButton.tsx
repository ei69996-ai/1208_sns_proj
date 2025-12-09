"use client";

import { useState } from "react";
import {
  getApiErrorMessage,
  isNetworkError,
  getNetworkErrorMessage,
} from "@/lib/utils/error-handler";

/**
 * @file FollowButton.tsx
 * @description 팔로우 버튼 컴포넌트
 *
 * Instagram 스타일의 팔로우 버튼
 * - "팔로우" 버튼 (파란색, 미팔로우 상태)
 * - "팔로잉" 버튼 (회색, 팔로우 중 상태)
 * - Hover 시 "언팔로우" (빨간 테두리)
 * - Optimistic UI 업데이트
 * - 로딩 상태 관리 및 에러 처리
 */

interface FollowButtonProps {
  followingId: string; // 팔로우할 사용자의 Clerk user ID
  isFollowing: boolean; // 초기 팔로우 상태
  onToggle?: (newIsFollowing: boolean) => void; // 상태 변경 콜백
}

export function FollowButton({
  followingId,
  isFollowing: initialIsFollowing,
  onToggle,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [hoverText, setHoverText] = useState<string | null>(null);

  const handleClick = async () => {
    // 중복 클릭 방지
    if (isLoading) return;

    // Optimistic update: UI 즉시 반영
    const newIsFollowing = !isFollowing;
    setIsFollowing(newIsFollowing);
    setIsLoading(true);

    try {
      if (newIsFollowing) {
        // 팔로우 추가
        const response = await fetch("/api/follows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ followingId }),
        });

        if (!response.ok) {
          if (response.status === 409) {
            // 이미 팔로우 중인 경우 (UNIQUE 제약)
            // 상태는 이미 업데이트되었으므로 그대로 유지
          } else {
            // 에러 메시지 추출
            const errorMessage = await getApiErrorMessage(response);
            // 상태 롤백
            setIsFollowing(initialIsFollowing);
            alert(errorMessage);
          }
        } else {
          // 성공 시 콜백 호출
          if (onToggle) {
            onToggle(newIsFollowing);
          }
        }
      } else {
        // 팔로우 제거
        const response = await fetch(`/api/follows?followingId=${followingId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          // 에러 메시지 추출
          const errorMessage = await getApiErrorMessage(response);
          // 상태 롤백
          setIsFollowing(initialIsFollowing);
          alert(errorMessage);
        } else {
          // 성공 시 콜백 호출
          if (onToggle) {
            onToggle(newIsFollowing);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      setIsFollowing(initialIsFollowing);
      const errorMessage = isNetworkError(error)
        ? getNetworkErrorMessage(error)
        : "팔로우 처리 중 오류가 발생했습니다.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 버튼 텍스트 결정
  const getButtonText = () => {
    if (hoverText) return hoverText;
    return isFollowing ? "팔로잉" : "팔로우";
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      onMouseEnter={() => {
        if (isFollowing) {
          setHoverText("언팔로우");
        }
      }}
      onMouseLeave={() => {
        setHoverText(null);
      }}
      className={`
        px-4 py-1.5 text-sm font-semibold rounded transition-colors
        ${isFollowing
          ? "bg-[var(--instagram-card)] border border-[var(--instagram-border)] text-[var(--instagram-text-primary)] hover:border-red-500 hover:text-red-500"
          : "bg-[var(--instagram-blue)] text-white hover:bg-[var(--instagram-blue)]/90"
        }
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
      aria-label={isFollowing ? "언팔로우" : "팔로우"}
    >
      {isLoading ? "처리 중..." : getButtonText()}
    </button>
  );
}

