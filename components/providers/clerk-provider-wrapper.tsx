'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { koKR } from '@clerk/localizations';

/**
 * @file clerk-provider-wrapper.tsx
 * @description Clerk Provider 래퍼 컴포넌트
 *
 * Clerk 설정을 중앙에서 관리하는 래퍼 컴포넌트
 * - 한국어 로컬라이제이션 적용
 * - Tailwind CSS 4 호환성을 위한 cssLayerName 설정
 */

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        cssLayerName: "clerk",
      }}
      localization={koKR}
    >
      {children}
    </ClerkProvider>
  );
}

