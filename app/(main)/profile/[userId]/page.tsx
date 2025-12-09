import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

/**
 * @file page.tsx
 * @description 프로필 페이지 (임시)
 *
 * 동적 라우트: /profile/[userId]
 * 추후 프로필 기능 구현 예정
 */

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId: paramUserId } = await params;
  const { userId: currentUserId } = await auth();

  // 임시: 프로필 페이지는 아직 구현되지 않음
  // TODO: ProfileHeader, PostGrid 컴포넌트 통합 필요

  return (
    <div className="max-w-[935px] mx-auto py-8 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--instagram-text-primary)] mb-4">
          프로필
        </h1>
        <p className="text-[var(--instagram-text-secondary)] mb-2">
          사용자 ID: {paramUserId}
        </p>
        {currentUserId === paramUserId && (
          <p className="text-sm text-[var(--instagram-text-secondary)]">
            (본인 프로필)
          </p>
        )}
        <p className="text-[var(--instagram-text-secondary)] mt-4">
          프로필 기능은 곧 제공될 예정입니다.
        </p>
      </div>
    </div>
  );
}

