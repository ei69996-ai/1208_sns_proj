import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase 브라우저 클라이언트 (공개 데이터용)
 *
 * Supabase 공식 Next.js 가이드 패턴을 따릅니다.
 * 인증이 필요 없는 공개 데이터 조회에 사용합니다.
 *
 * **사용 시나리오:**
 * - 공개 데이터 조회 (RLS 정책이 `to anon`인 데이터)
 * - 인증 불필요한 데이터 접근
 *
 * **인증이 필요한 경우:**
 * - Client Component: `lib/supabase/clerk-client.ts`의 `useClerkSupabaseClient()` 사용
 * - Server Component: `lib/supabase/server.ts`의 `createClerkSupabaseClient()` 사용
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { supabase } from '@/lib/supabase/client';
 *
 * export default function PublicData() {
 *   // 공개 데이터만 조회 가능
 *   const { data } = await supabase
 *     .from('public_posts')
 *     .select('*');
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * @see {@link https://supabase.com/docs/guides/getting-started/quickstarts/nextjs Supabase Next.js 공식 가이드}
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and Anon Key must be set in environment variables"
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
