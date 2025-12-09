# Supabase Storage 버킷 설정 가이드

이 가이드는 Instagram Clone SNS 프로젝트의 이미지 저장을 위한 Supabase Storage 버킷을 생성하고 설정하는 방법을 설명합니다.

## Storage 버킷 생성

### 1단계: Supabase Dashboard 접속

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택

### 2단계: Storage 메뉴 열기

1. 좌측 메뉴에서 **"Storage"** 클릭
2. **"New bucket"** 버튼 클릭

### 3단계: 버킷 설정

다음 정보를 입력합니다:

- **Name**: `uploads`
- **Public bucket**: ✅ **체크** (공개 읽기 활성화)
  - 이렇게 하면 인증 없이도 이미지 URL로 접근 가능합니다
- **File size limit**: `5MB` (또는 원하는 크기)
- **Allowed MIME types**: (선택사항)
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`

### 4단계: 버킷 생성

1. **"Create bucket"** 버튼 클릭
2. 버킷이 생성되었는지 확인

## Storage 업로드 정책 설정

### 개발 단계: RLS 비활성화 (권장)

개발 초기 단계에서는 RLS를 비활성화하여 빠르게 개발할 수 있습니다:

1. Storage 메뉴에서 `uploads` 버킷 클릭
2. **"Policies"** 탭 클릭
3. RLS가 비활성화되어 있는지 확인
4. 필요시 **"Disable RLS"** 클릭

### 프로덕션 단계: RLS 정책 설정

프로덕션 환경에서는 반드시 RLS를 활성화하고 적절한 정책을 설정해야 합니다.

#### 1. RLS 활성화

1. Storage 메뉴에서 `uploads` 버킷 클릭
2. **"Policies"** 탭 클릭
3. **"Enable RLS"** 클릭

#### 2. 업로드 정책 (INSERT)

인증된 사용자만 자신의 폴더에 업로드할 수 있도록 설정:

```sql
-- Storage 버킷: uploads
-- 정책: 인증된 사용자만 자신의 폴더에 업로드 가능

CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
);
```

#### 3. 읽기 정책 (SELECT)

인증된 사용자만 이미지를 조회할 수 있도록 설정 (또는 공개 읽기):

```sql
-- 공개 읽기 정책 (Public bucket이므로)
CREATE POLICY "Public can read uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');
```

또는 인증된 사용자만 읽기:

```sql
-- 인증된 사용자만 읽기
CREATE POLICY "Authenticated users can read uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'uploads');
```

#### 4. 삭제 정책 (DELETE)

본인만 자신의 파일을 삭제할 수 있도록 설정:

```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
);
```

#### 5. 업데이트 정책 (UPDATE)

본인만 자신의 파일을 업데이트할 수 있도록 설정:

```sql
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
)
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
);
```

## 업로드 경로 구조

프로젝트에서는 다음 경로 구조를 사용합니다:

```
uploads/
  └── {clerk_user_id}/
      └── {post_id}/
          └── {filename}
```

예시:
```
uploads/
  └── user_2abc123def/
      └── post_550e8400-e29b-41d4-a716-446655440000/
          └── image.jpg
```

이 구조의 장점:
- 사용자별로 파일이 분리되어 관리 용이
- 게시물별로 파일이 분리되어 삭제 시 정리 용이
- RLS 정책에서 사용자 ID로 접근 제어 가능

## Storage 테스트

### 1. 업로드 테스트

애플리케이션에서 다음 코드로 테스트:

```typescript
import { createClerkSupabaseClient } from '@/lib/supabase/server';

const supabase = await createClerkSupabaseClient();
const { data, error } = await supabase.storage
  .from('uploads')
  .upload(`${clerkUserId}/${postId}/${filename}`, file);

if (error) {
  console.error('Upload error:', error);
} else {
  console.log('Upload successful:', data);
}
```

### 2. URL 접근 테스트

업로드된 파일의 공개 URL을 가져옵니다:

```typescript
const { data } = supabase.storage
  .from('uploads')
  .getPublicUrl(`${clerkUserId}/${postId}/${filename}`);

console.log('Public URL:', data.publicUrl);
```

브라우저에서 이 URL로 직접 접근하여 이미지가 표시되는지 확인합니다.

### 3. 파일 목록 조회 테스트

특정 사용자의 파일 목록을 조회합니다:

```typescript
const { data, error } = await supabase.storage
  .from('uploads')
  .list(`${clerkUserId}`, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' }
  });
```

## 환경 변수 확인

`.env` 파일에 다음 변수가 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

## 문제 해결

### 에러: "new row violates row-level security policy"

RLS 정책이 활성화되어 있지만 적절한 정책이 설정되지 않았을 수 있습니다. 개발 단계에서는 RLS를 비활성화하거나, 위의 정책 예시를 참고하여 정책을 설정하세요.

### 에러: "The resource already exists"

같은 경로에 파일이 이미 존재합니다. 파일명을 변경하거나 기존 파일을 삭제한 후 다시 시도하세요.

### 에러: "File size exceeds the maximum allowed size"

파일 크기가 5MB를 초과했습니다. 이미지를 압축하거나 크기를 줄이세요.

### 이미지가 표시되지 않음

1. 버킷이 Public으로 설정되어 있는지 확인
2. 파일 경로가 올바른지 확인
3. 브라우저 개발자 도구에서 네트워크 탭 확인
4. CORS 설정 확인 (Supabase는 기본적으로 CORS가 활성화되어 있음)

## 다음 단계

Storage 버킷 설정이 완료되면:

1. 게시물 작성 기능에서 이미지 업로드 구현
2. PostCard 컴포넌트에서 이미지 표시 구현
3. 이미지 최적화 (Next.js Image 컴포넌트 사용)

## 참고 자료

- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [Storage RLS 정책 가이드](https://supabase.com/docs/guides/storage/security/access-control)
- [Next.js Image 최적화](https://nextjs.org/docs/app/api-reference/components/image)

