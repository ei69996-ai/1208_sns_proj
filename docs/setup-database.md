# 데이터베이스 마이그레이션 가이드

이 가이드는 Instagram Clone SNS 프로젝트의 데이터베이스 스키마를 Supabase에 적용하는 방법을 설명합니다.

## 마이그레이션 파일

- **파일명**: `supabase/migrations/20250108000000_initial_schema.sql`
- **내용**: 
  - Users, Posts, Likes, Comments, Follows 테이블 생성
  - post_stats, user_stats 뷰 생성
  - handle_updated_at 트리거 함수 생성

## 방법 1: Supabase Dashboard SQL Editor 사용 (권장)

### 1단계: Supabase Dashboard 접속

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택

### 2단계: SQL Editor 열기

1. 좌측 메뉴에서 **"SQL Editor"** 클릭
2. **"New query"** 버튼 클릭

### 3단계: 마이그레이션 파일 실행

1. `supabase/migrations/20250108000000_initial_schema.sql` 파일을 열어서 전체 내용 복사
2. SQL Editor에 붙여넣기
3. **"Run"** 버튼 클릭 (또는 `Ctrl + Enter`)
4. 성공 메시지 확인: `Success. No rows returned`

### 4단계: 테이블 생성 확인

1. 좌측 메뉴에서 **"Table Editor"** 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - ✅ `users`
   - ✅ `posts`
   - ✅ `likes`
   - ✅ `comments`
   - ✅ `follows`

### 5단계: 뷰 생성 확인

1. SQL Editor에서 다음 쿼리 실행:

```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('post_stats', 'user_stats');
```

2. 결과에 `post_stats`와 `user_stats`가 표시되어야 합니다.

### 6단계: 트리거 함수 확인

1. SQL Editor에서 다음 쿼리 실행:

```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name = 'set_updated_at';
```

2. `posts`와 `comments` 테이블에 트리거가 적용되어 있는지 확인합니다.

## 방법 2: Supabase CLI 사용 (선택사항)

### 전제 조건

- Supabase CLI 설치: `npm install -g supabase`
- Supabase 프로젝트 연결 설정

### 실행 방법

```bash
# Supabase 프로젝트에 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

## 데이터베이스 스키마 검증 체크리스트

마이그레이션 실행 후 다음 항목들을 확인하세요:

### 테이블 확인

- [ ] `users` 테이블 생성됨
  - 컬럼: `id`, `clerk_id`, `name`, `created_at`
  - `clerk_id`에 UNIQUE 제약 조건 적용됨
- [ ] `posts` 테이블 생성됨
  - 컬럼: `id`, `user_id`, `image_url`, `caption`, `created_at`, `updated_at`
  - `user_id`에 외래 키 제약 조건 적용됨
- [ ] `likes` 테이블 생성됨
  - 컬럼: `id`, `post_id`, `user_id`, `created_at`
  - `(post_id, user_id)`에 UNIQUE 제약 조건 적용됨
- [ ] `comments` 테이블 생성됨
  - 컬럼: `id`, `post_id`, `user_id`, `content`, `created_at`, `updated_at`
- [ ] `follows` 테이블 생성됨
  - 컬럼: `id`, `follower_id`, `following_id`, `created_at`
  - `(follower_id, following_id)`에 UNIQUE 제약 조건 적용됨
  - 자기 자신 팔로우 방지 CHECK 제약 조건 적용됨

### 인덱스 확인

- [ ] `idx_posts_user_id` 생성됨
- [ ] `idx_posts_created_at` 생성됨
- [ ] `idx_likes_post_id` 생성됨
- [ ] `idx_likes_user_id` 생성됨
- [ ] `idx_comments_post_id` 생성됨
- [ ] `idx_comments_user_id` 생성됨
- [ ] `idx_comments_created_at` 생성됨
- [ ] `idx_follows_follower_id` 생성됨
- [ ] `idx_follows_following_id` 생성됨

### 뷰 확인

- [ ] `post_stats` 뷰 생성됨
  - `likes_count`, `comments_count` 포함
- [ ] `user_stats` 뷰 생성됨
  - `posts_count`, `followers_count`, `following_count` 포함

### 트리거 확인

- [ ] `handle_updated_at()` 함수 생성됨
- [ ] `posts` 테이블에 `set_updated_at` 트리거 적용됨
- [ ] `comments` 테이블에 `set_updated_at` 트리거 적용됨

### RLS 상태 확인

개발 단계에서는 RLS가 비활성화되어 있어야 합니다:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'posts', 'likes', 'comments', 'follows');
```

모든 테이블의 `rowsecurity`가 `false`여야 합니다.

## 문제 해결

### 에러: "relation already exists"

테이블이 이미 존재하는 경우, 마이그레이션 파일의 `CREATE TABLE IF NOT EXISTS` 구문으로 인해 에러 없이 넘어갑니다. 하지만 기존 테이블 구조가 다를 수 있으므로 확인이 필요합니다.

### 에러: "permission denied"

서비스 역할 키를 사용하거나, Supabase Dashboard에서 직접 실행해야 합니다.

### 에러: "foreign key constraint fails"

`users` 테이블이 먼저 생성되어야 합니다. 마이그레이션 파일의 순서를 확인하세요.

## 다음 단계

데이터베이스 마이그레이션이 완료되면:

1. [Storage 버킷 설정 가이드](./setup-storage.md) 참고하여 Storage 버킷 생성
2. 애플리케이션에서 데이터베이스 연결 테스트
3. 샘플 데이터 삽입하여 테스트

## 참고 자료

- [Supabase SQL Editor 문서](https://supabase.com/docs/guides/database/tables)
- [PostgreSQL 데이터 타입](https://www.postgresql.org/docs/current/datatype.html)
- [Supabase 마이그레이션 가이드](https://supabase.com/docs/guides/cli/local-development#database-migrations)

