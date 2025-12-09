# Supabase 설정 확인 가이드

이 가이드는 Supabase 데이터베이스 마이그레이션과 Storage 버킷이 제대로 설정되었는지 확인하는 방법을 설명합니다.

## 자동 검증 스크립트 사용

### 1. 데이터베이스 검증

```bash
npx tsx scripts/verify-database.ts
```

이 스크립트는 다음을 확인합니다:
- ✅ `users`, `posts`, `likes`, `comments`, `follows` 테이블 생성 여부
- ✅ `post_stats`, `user_stats` 뷰 생성 여부

### 2. Storage 버킷 검증

```bash
npx tsx scripts/verify-storage.ts
```

이 스크립트는 다음을 확인합니다:
- ✅ `posts` 버킷 생성 여부
- ✅ 버킷 공개 설정 여부

## 수동 확인 방법

### 데이터베이스 확인

1. Supabase Dashboard → **Table Editor**에서 다음 테이블 확인:
   - `users`
   - `posts`
   - `likes`
   - `comments`
   - `follows`

2. Supabase Dashboard → **SQL Editor**에서 다음 쿼리 실행:

```sql
-- 뷰 확인
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('post_stats', 'user_stats');

-- 트리거 확인
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name = 'set_updated_at';
```

### Storage 확인

1. Supabase Dashboard → **Storage**에서 `posts` 버킷 확인
2. 버킷이 **Public**으로 설정되어 있는지 확인

## 다음 단계

검증이 완료되면:
1. 애플리케이션에서 데이터베이스 연결 테스트
2. 샘플 데이터 삽입하여 테스트
3. 이미지 업로드 테스트

