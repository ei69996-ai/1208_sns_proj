/**
 * @file PostCardSkeleton.tsx
 * @description 게시물 카드 로딩 UI (Skeleton)
 *
 * PostCard와 동일한 레이아웃 구조
 * Shimmer 애니메이션 효과
 */

export function PostCardSkeleton() {
  return (
    <div className="bg-[var(--instagram-card)] border border-[var(--instagram-border)] rounded-lg mb-4">
      {/* 헤더 Skeleton */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--instagram-border)]">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* 이미지 Skeleton */}
      <div className="aspect-square bg-gray-200 animate-pulse" />

      {/* 액션 버튼 Skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--instagram-border)]">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* 컨텐츠 Skeleton */}
      <div className="px-4 py-3 space-y-2">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-1">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

