import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Server Component/Server Action용)
 *
 * Supabase 공식 Next.js 가이드 패턴을 따르면서 Clerk 통합을 지원합니다.
 * 
 * 2025년 권장 방식:
 * - @supabase/ssr의 createServerClient 사용 (Supabase 공식 권장)
 * - JWT 템플릿 불필요
 * - Clerk Dashboard에서 Supabase 통합 활성화 필요
 * - Supabase Dashboard에서 Clerk를 Third-Party Auth Provider로 설정 필요
 * - auth().getToken()으로 현재 세션 토큰을 자동으로 전달
 * - Server Component와 Server Action에서 사용
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
 * // Server Component (Supabase 공식 가이드 패턴)
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 * import { auth } from '@clerk/nextjs/server';
 * import { redirect } from 'next/navigation';
 * import { Suspense } from 'react';
 *
 * async function DataComponent() {
 *   const supabase = await createClerkSupabaseClient();
 *   const { data, error } = await supabase.from('tasks').select('*');
 *
 *   if (error) {
 *     throw new Error('Failed to fetch tasks');
 *   }
 *
 *   return <pre>{JSON.stringify(data, null, 2)}</pre>;
 * }
 *
 * export default async function MyPage() {
 *   const { userId } = await auth();
 *
 *   if (!userId) {
 *     redirect('/sign-in');
 *   }
 *
 *   return (
 *     <Suspense fallback={<div>Loading...</div>}>
 *       <DataComponent />
 *     </Suspense>
 *   );
 * }
 * ```
 *
 * @example
 * ```ts
 * // Server Action
 * 'use server';
 *
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 * import { auth } from '@clerk/nextjs/server';
 *
 * export async function createTask(name: string) {
 *   const { userId } = await auth();
 *
 *   if (!userId) {
 *     throw new Error('Unauthorized');
 *   }
 *
 *   const supabase = await createClerkSupabaseClient();
 *
 *   const { data, error } = await supabase
 *     .from('tasks')
 *     .insert({ name, user_id: userId })
 *     .select()
 *     .single();
 *
 *   if (error) {
 *     throw new Error('Failed to create task');
 *   }
 *
 *   return data;
 * }
 * ```
 *
 * @see {@link https://supabase.com/docs/guides/getting-started/quickstarts/nextjs Supabase Next.js 공식 가이드}
 * @see {@link https://clerk.com/docs/guides/development/integrations/databases/supabase Clerk Supabase 통합 가이드}
 * @see {@link https://supabase.com/docs/guides/auth/third-party/overview Supabase Third-Party Auth 문서}
 */
export async function createClerkSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase URL and Anon Key must be set in environment variables"
    );
  }

  const cookieStore = await cookies();

  // Supabase 공식 가이드 패턴: @supabase/ssr의 createServerClient 사용
  // Clerk 통합: accessToken으로 Clerk 토큰 전달
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Server Component에서는 읽기 전용이므로 경고만 로그
        // 실제 쿠키 설정은 Middleware에서 처리
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Server Component에서 쿠키 설정 시도는 무시
          // Middleware에서 세션 갱신을 처리해야 함
        }
      },
    },
    // Clerk 토큰을 Supabase 요청에 자동으로 포함
    // 이 토큰은 Clerk Dashboard에서 Supabase 통합을 활성화하면
    // 'role': 'authenticated' 클레임이 자동으로 포함됨
    async accessToken() {
      return (await auth()).getToken() ?? null;
    },
  });
}
