/**
 * @file page.tsx
 * @description 검색 페이지 (임시)
 *
 * 1차 개발에서는 UI만 제공
 * 추후 검색 기능 구현 예정
 */

export default function SearchPage() {
  return (
    <div className="max-w-[630px] mx-auto py-8 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--instagram-text-primary)] mb-4">
          검색
        </h1>
        <p className="text-[var(--instagram-text-secondary)]">
          검색 기능은 곧 제공될 예정입니다.
        </p>
      </div>
    </div>
  );
}

