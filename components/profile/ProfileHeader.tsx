"use client";

import { useState, useEffect } from "react";
import type { UserWithStats } from "@/lib/types";

/**
 * @file ProfileHeader.tsx
 * @description 프로필 헤더 컴포넌트
 *
 * Instagram 스타일의 프로필 헤더
 * - 프로필 이미지 (150px Desktop / 90px Mobile)
 * - 사용자명
 * - 통계 (게시물 수, 팔로워 수, 팔로잉 수)
 * - 팔로우/팔로잉 버튼 (다른 사람 프로필)
 */

interface ProfileHeaderProps {
  userId: string; // Clerk user ID
  currentUserId?: string; // 현재 로그인한 사용자의 Clerk user ID
  initialData?: UserWithStats & { is_following: boolean };
}

export function ProfileHeader({
  userId,
  currentUserId,
  initialData,
}: ProfileHeaderProps) {
  const [userData, setUserData] = useState<
    (UserWithStats & { is_following: boolean }) | null
  >(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(
    initialData?.is_following || false
  );

  // 사용자 정보 조회
  useEffect(() => {
    if (initialData) {
      setUserData(initialData);
      setIsFollowing(initialData.is_following);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const result = await response.json();
        const data = result.data as UserWithStats & { is_following: boolean };

        setUserData(data);
        setIsFollowing(data.is_following);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("사용자 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, initialData]);

  // 본인 프로필 여부
  const isOwnProfile = currentUserId === userId;

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center gap-8 py-8">
        <div className="w-[150px] h-[150px] md:w-[90px] md:h-[90px] rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !userData) {
    return (
      <div className="py-8 text-center text-red-500">
        {error || "사용자를 찾을 수 없습니다."}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 py-4 md:py-8">
      {/* 프로필 이미지 */}
      <div className="w-[150px] h-[150px] md:w-[90px] md:h-[90px] rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-4xl md:text-2xl">
          {userData.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* 사용자 정보 */}
      <div className="flex-1 min-w-0">
        {/* 사용자명 및 버튼 */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <h1 className="text-2xl md:text-xl font-light text-[var(--instagram-text-primary)]">
            {userData.name}
          </h1>

          {/* 버튼 영역 */}
          {isOwnProfile ? (
            <button
              className="px-4 py-1.5 text-sm font-semibold border border-[var(--instagram-border)] rounded text-[var(--instagram-text-primary)] hover:bg-[var(--instagram-background)]"
              disabled
            >
              프로필 편집
            </button>
          ) : (
            <button
              onClick={() => {
                // TODO: 팔로우 기능 구현 (## 9. 팔로우 기능)
                console.log("Follow/Unfollow clicked");
              }}
              className={`
                px-4 py-1.5 text-sm font-semibold rounded
                ${
                  isFollowing
                    ? "bg-[var(--instagram-card)] border border-[var(--instagram-border)] text-[var(--instagram-text-primary)] hover:border-red-500 hover:text-red-500"
                    : "bg-[var(--instagram-blue)] text-white hover:bg-[var(--instagram-blue)]/90"
                }
              `}
            >
              {isFollowing ? "팔로잉" : "팔로우"}
            </button>
          )}
        </div>

        {/* 통계 */}
        <div className="flex items-center gap-6 md:gap-8 mb-4">
          <div className="text-center md:text-left">
            <span className="font-semibold text-[var(--instagram-text-primary)]">
              {userData.posts_count.toLocaleString()}
            </span>
            <span className="text-[var(--instagram-text-secondary)] ml-1">
              게시물
            </span>
          </div>
          <div className="text-center md:text-left">
            <span className="font-semibold text-[var(--instagram-text-primary)]">
              {userData.followers_count.toLocaleString()}
            </span>
            <span className="text-[var(--instagram-text-secondary)] ml-1">
              팔로워
            </span>
          </div>
          <div className="text-center md:text-left">
            <span className="font-semibold text-[var(--instagram-text-primary)]">
              {userData.following_count.toLocaleString()}
            </span>
            <span className="text-[var(--instagram-text-secondary)] ml-1">
              팔로잉
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

