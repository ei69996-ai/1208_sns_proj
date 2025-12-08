-- RLS 정책 예시 마이그레이션 파일
-- 
-- 이 파일은 Clerk + Supabase 통합 시 RLS 정책을 설정하는 예시입니다.
-- 실제 프로덕션 환경에서는 적절한 RLS 정책을 설정해야 합니다.
--
-- 참고: 개발 환경에서는 RLS를 비활성화할 수 있지만,
-- 프로덕션에서는 반드시 RLS를 활성화하고 적절한 정책을 설정해야 합니다.

-- ============================================
-- 예시 1: tasks 테이블 (Clerk 문서 예시 기반)
-- ============================================

-- tasks 테이블 생성 (예시)
CREATE TABLE IF NOT EXISTS public.tasks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT (auth.jwt()->>'sub'),
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS 활성화
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 사용자는 자신의 tasks만 조회 가능
CREATE POLICY "User can view their own tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
    (SELECT auth.jwt()->>'sub') = user_id
);

-- INSERT 정책: 사용자는 자신의 tasks만 생성 가능
CREATE POLICY "Users must insert their own tasks"
ON public.tasks
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT auth.jwt()->>'sub') = user_id
);

-- UPDATE 정책: 사용자는 자신의 tasks만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
    (SELECT auth.jwt()->>'sub') = user_id
)
WITH CHECK (
    (SELECT auth.jwt()->>'sub') = user_id
);

-- DELETE 정책: 사용자는 자신의 tasks만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (
    (SELECT auth.jwt()->>'sub') = user_id
);

-- ============================================
-- 예시 2: users 테이블 RLS 정책 (참고용)
-- ============================================

-- users 테이블에 RLS 활성화 (개발 중에는 비활성화되어 있음)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 사용자는 자신의 정보만 조회 가능
-- CREATE POLICY "Users can view their own data"
-- ON public.users
-- FOR SELECT
-- TO authenticated
-- USING (
--     (SELECT auth.jwt()->>'sub') = clerk_id
-- );

-- INSERT 정책: 인증된 사용자는 자신의 정보를 생성할 수 있음
-- CREATE POLICY "Users can insert their own data"
-- ON public.users
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (
--     (SELECT auth.jwt()->>'sub') = clerk_id
-- );

-- UPDATE 정책: 사용자는 자신의 정보만 수정 가능
-- CREATE POLICY "Users can update their own data"
-- ON public.users
-- FOR UPDATE
-- TO authenticated
-- USING (
--     (SELECT auth.jwt()->>'sub') = clerk_id
-- )
-- WITH CHECK (
--     (SELECT auth.jwt()->>'sub') = clerk_id
-- );

-- ============================================
-- RLS 정책 작성 가이드
-- ============================================
--
-- 1. auth.jwt()->>'sub'는 Clerk 사용자 ID를 반환합니다
-- 2. USING 절: 기존 행에 대한 접근 권한 확인 (SELECT, UPDATE, DELETE)
-- 3. WITH CHECK 절: 새 행 또는 수정된 행에 대한 검증 (INSERT, UPDATE)
-- 4. TO authenticated: 인증된 사용자에게만 정책 적용
-- 5. TO anon: 익명 사용자에게도 정책 적용 (공개 데이터용)
--
-- 예시 패턴:
-- - 자신의 데이터만 접근: USING (auth.jwt()->>'sub' = user_id)
-- - 모든 인증된 사용자가 읽기 가능: USING (true) TO authenticated
-- - 공개 데이터: USING (true) TO anon
-- - 관리자만 접근: USING (auth.jwt()->>'role' = 'admin') TO authenticated

