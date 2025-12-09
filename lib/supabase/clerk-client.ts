"use client";

import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Client Component용)
 *
 * Supabase 공식 Next.js 가이드 패턴을 따르면서 Clerk 통합을 지원합니다.
 *
 * 2025년 권장 방식:
 * - @supabase/ssr의 createBrowserClient 사용 (Supabase 공식 권장)
 * - JWT 템플릿 불필요
 * - Clerk Dashboard에서 Supabase 통합 활성화 필요
 * - Supabase Dashboard에서 Clerk를 Third-Party Auth Provider로 설정 필요
 * - useAuth().getToken()으로 현재 세션 토큰을 자동으로 전달
 * - React Hook으로 제공되어 Client Component에서 사용
 *
 * **설정 요구사항:**
 * 1. Clerk Dashboard → Integrations → Supabase → "Activate Supabase integration"
 * 2. Supabase Dashboard → Settings → Authentication → Providers → Clerk 추가
 *
 * **RLS 정책:**
 * - RLS 정책에서 `auth.jwt()->>'sub'`로 Clerk 사용자 ID 확인
 * - 예시: `USING ((SELECT auth.jwt()->>'sub') = user_id)`
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 * import { useUser } from '@clerk/nextjs';
 * import { useEffect, useState } from 'react';
 *
 * export default function MyComponent() {
 *   const { user } = useUser();
 *   const supabase = useClerkSupabaseClient();
 *   const [data, setData] = useState(null);
 *
 *   useEffect(() => {
 *     if (!user) return;
 *
 *     async function fetchData() {
 *       // RLS 정책에 따라 사용자 자신의 데이터만 반환됨
 *       const { data, error } = await supabase
 *         .from('tasks')
 *         .select('*');
 *
 *       if (error) {
 *         console.error('Error:', error);
 *         return;
 *       }
 *
 *       setData(data);
 *     }
 *
 *     fetchData();
 *   }, [user, supabase]);
 *
 *   return <div>데이터 표시</div>;
 * }
 * ```
 *
 * @see {@link https://supabase.com/docs/guides/getting-started/quickstarts/nextjs Supabase Next.js 공식 가이드}
 * @see {@link https://clerk.com/docs/guides/development/integrations/databases/supabase Clerk Supabase 통합 가이드}
 * @see {@link https://supabase.com/docs/guides/auth/third-party/overview Supabase Third-Party Auth 문서}
 */
export function useClerkSupabaseClient() {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase URL and Anon Key must be set in environment variables"
      );
    }

    // @supabase/supabase-js의 createClient 사용
    // Clerk 통합: accessToken 옵션으로 Clerk 토큰 전달
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Clerk가 세션을 관리하므로 Supabase 세션은 유지하지 않음
        autoRefreshToken: false, // Clerk가 토큰을 관리하므로 자동 갱신 불필요
        async accessToken() {
          return (await getToken()) ?? null;
        },
      } as any,
    });
  }, [getToken]);

  return supabase;
}
