import Link from "next/link";

/**
 * @file not-found.tsx
 * @description 404 에러 페이지
 *
 * 페이지를 찾을 수 없을 때 표시되는 커스텀 404 페이지
 */

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--instagram-background)] px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-[var(--instagram-text-primary)] mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-[var(--instagram-text-primary)] mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-[var(--instagram-text-secondary)] mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[var(--instagram-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

