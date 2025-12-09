# 배포 가이드

이 문서는 Instagram Clone SNS 프로젝트를 Vercel에 배포하는 방법을 설명합니다.

## 사전 준비

### 1. Vercel 계정 생성

1. [Vercel](https://vercel.com)에 가입
2. GitHub 계정으로 연동 (권장)

### 2. 환경 변수 준비

다음 환경 변수들을 준비합니다:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

## Vercel 배포

### 방법 1: GitHub 연동 (권장)

1. **GitHub 저장소 연결**
   - Vercel Dashboard → "Add New Project"
   - GitHub 저장소 선택
   - 프로젝트 설정 확인

2. **환경 변수 설정**
   - "Environment Variables" 섹션으로 이동
   - 위의 환경 변수들을 모두 추가
   - 각 환경(Production, Preview, Development)에 설정

3. **빌드 설정 확인**
   - Framework Preset: Next.js
   - Build Command: `pnpm build` (자동 감지)
   - Output Directory: `.next` (자동 감지)
   - Install Command: `pnpm install` (자동 감지)

4. **배포 실행**
   - "Deploy" 버튼 클릭
   - 빌드 로그 확인

### 방법 2: Vercel CLI

1. **Vercel CLI 설치**
   ```bash
   pnpm add -g vercel
   ```

2. **로그인**
   ```bash
   vercel login
   ```

3. **프로젝트 배포**
   ```bash
   vercel
   ```

4. **환경 변수 설정**
   ```bash
   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   vercel env add CLERK_SECRET_KEY
   # ... 나머지 환경 변수들도 동일하게 추가
   ```

5. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

## Supabase 프로덕션 설정

### 1. RLS 정책 활성화

프로덕션 환경에서는 반드시 RLS를 활성화해야 합니다:

1. Supabase Dashboard → Storage → `uploads` 버킷
2. "Policies" 탭 → "Enable RLS" 클릭
3. 필요한 정책들이 설정되어 있는지 확인

### 2. CORS 설정

Supabase Storage의 CORS 설정 확인:

1. Supabase Dashboard → Storage → Settings
2. CORS 설정에서 Vercel 도메인 추가

### 3. 환경 변수 확인

프로덕션 환경 변수가 올바르게 설정되었는지 확인:

- `NEXT_PUBLIC_SUPABASE_URL`: 프로덕션 Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 프로덕션 anon key
- `SUPABASE_SERVICE_ROLE_KEY`: 프로덕션 service role key

## Clerk 프로덕션 설정

### 1. 프로덕션 환경 생성

1. Clerk Dashboard → Environments
2. "Production" 환경 선택 또는 생성

### 2. 리다이렉트 URL 설정

1. Clerk Dashboard → User & Authentication → Redirect URLs
2. Vercel 도메인 추가:
   - `https://your-domain.vercel.app`
   - `https://your-domain.vercel.app/sign-in`
   - `https://your-domain.vercel.app/sign-up`

### 3. 환경 변수 확인

프로덕션 환경 변수가 올바르게 설정되었는지 확인:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: 프로덕션 publishable key
- `CLERK_SECRET_KEY`: 프로덕션 secret key

## 도메인 연결

### 1. 커스텀 도메인 추가

1. Vercel Dashboard → 프로젝트 → Settings → Domains
2. "Add Domain" 클릭
3. 도메인 입력 (예: `yourdomain.com`)

### 2. DNS 설정

도메인 제공업체에서 DNS 레코드 설정:

- **A 레코드**: `@` → Vercel IP 주소
- **CNAME 레코드**: `www` → `cname.vercel-dns.com`

### 3. SSL 인증서

Vercel이 자동으로 SSL 인증서를 발급합니다.

## 배포 후 확인

### 1. 기능 테스트

- [ ] 홈 피드 로드
- [ ] 게시물 작성
- [ ] 게시물 좋아요
- [ ] 댓글 작성
- [ ] 프로필 페이지
- [ ] 팔로우/언팔로우

### 2. 성능 확인

- [ ] Lighthouse 점수 확인 (90+ 목표)
- [ ] 이미지 로딩 속도 확인
- [ ] API 응답 시간 확인

### 3. 에러 모니터링

- [ ] Vercel 로그 확인
- [ ] Supabase 로그 확인
- [ ] Clerk 로그 확인

## 문제 해결

### 빌드 실패

1. **환경 변수 확인**
   - 모든 필수 환경 변수가 설정되었는지 확인
   - 변수 이름에 오타가 없는지 확인

2. **의존성 문제**
   - `package.json`의 의존성 버전 확인
   - `pnpm install` 로컬에서 실행하여 에러 확인

3. **TypeScript 에러**
   - `pnpm build` 로컬에서 실행하여 에러 확인
   - 타입 에러 수정

### 이미지가 표시되지 않음

1. **Supabase Storage 설정 확인**
   - 버킷이 공개로 설정되었는지 확인
   - RLS 정책이 올바르게 설정되었는지 확인

2. **Next.js Image 설정 확인**
   - `next.config.ts`의 `remotePatterns` 확인
   - Supabase 도메인이 포함되어 있는지 확인

### 인증 문제

1. **Clerk 설정 확인**
   - 리다이렉트 URL이 올바르게 설정되었는지 확인
   - 환경 변수가 올바른지 확인

2. **Supabase 인증 확인**
   - Clerk와 Supabase 연동이 올바른지 확인
   - 사용자 동기화가 작동하는지 확인

## 참고

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Supabase 프로덕션 가이드](https://supabase.com/docs/guides/hosting/overview)
- [Clerk 프로덕션 가이드](https://clerk.com/docs/deployments/overview)

