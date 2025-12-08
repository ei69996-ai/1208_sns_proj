# 홈 피드 페이지 개발 계획

## 개요

Instagram Clone SNS 프로젝트의 홈 피드 페이지를 구현합니다. 게시물 목록 표시, 무한 스크롤, PostCard 컴포넌트, 로딩 UI를 포함합니다.

## 목표

- 홈 피드 페이지 (`app/(main)/page.tsx`) 구현
- PostCard 컴포넌트 구현 (Instagram 스타일)
- PostFeed 컴포넌트 구현 (무한 스크롤, 페이지네이션)
- PostCardSkeleton 로딩 UI 구현
- 게시물 목록 조회 API (`/api/posts`) 구현

## 현재 상태

- `lib/types.ts`: Post, User, PostWithStats 타입 정의 완료
- `supabase/migrations/20250108000000_initial_schema.sql`: 데이터베이스 스키마 준비 완료
- `app/(main)/layout.tsx`: 레이아웃 구조 (예정)
- `components/post/` 디렉토리: 아직 생성되지 않음
- `app/api/posts/` 디렉토리: 아직 생성되지 않음

## 구현 계획

### 1. 디렉토리 구조 생성

#### 1.1 컴포넌트 디렉토리 생성
- `components/post/` 디렉토리 생성
- PostCard, PostCardSkeleton, PostFeed 컴포넌트를 이 디렉토리에 배치

#### 1.2 API 라우트 디렉토리 생성
- `app/api/posts/` 디렉토리 생성
- `route.ts` 파일 생성

### 2. app/api/posts/route.ts 구현

#### 2.1 GET 메서드 구현
- 게시물 목록 조회 API
- 시간 역순 정렬 (`created_at DESC`)
- 페이지네이션 지원 (`limit`, `offset` 쿼리 파라미터)
- `userId` 쿼리 파라미터 지원 (프로필 페이지용, 선택사항)

#### 2.2 데이터 조회 로직
```typescript
// 기본 쿼리
const query = supabase
  .from('posts')
  .select(`
    *,
    user:users!posts_user_id_fkey(id, clerk_id, name),
    likes_count:likes(count),
    comments_count:comments(count)
  `)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);

// userId 필터 (프로필 페이지용)
if (userId) {
  query.eq('user_id', userId);
}
```

#### 2.3 응답 형식
```typescript
{
  data: PostWithUserAndStats[],
  meta: {
    total: number,
    limit: number,
    offset: number,
    hasMore: boolean
  }
}
```

#### 2.4 에러 처리
- 인증되지 않은 사용자 처리
- 데이터베이스 에러 처리
- 적절한 HTTP 상태 코드 반환

### 3. components/post/PostCard.tsx 구현

#### 3.1 Props 타입 정의
```typescript
interface PostCardProps {
  post: PostWithUserAndStats;
  currentUserId?: string; // 좋아요 상태 확인용
  onLike?: (postId: string) => void;
  onCommentClick?: (postId: string) => void;
}
```

#### 3.2 헤더 섹션 (60px 높이)
- **프로필 이미지**: 32px 원형 (Clerk UserButton 또는 기본 아바타)
- **사용자명**: Bold, 클릭 시 프로필 페이지로 이동
- **시간**: 상대 시간 표시 (예: "3시간 전"), 작은 폰트, 회색
- **⋯ 메뉴**: 우측 정렬, 드롭다운 메뉴 (1차에서는 UI만, 기능은 나중에)

#### 3.3 이미지 섹션
- **비율**: 1:1 정사각형 (aspect-square)
- **이미지**: Next.js Image 컴포넌트 사용 (최적화)
- **더블탭 좋아요**: 모바일에서만 작동
  - 더블탭 감지 (useRef, setTimeout 사용)
  - 큰 하트 애니메이션 (fade in/out)
  - 좋아요 API 호출

#### 3.4 액션 버튼 섹션 (48px 높이)
- **좌측**: 
  - ❤️ 좋아요 버튼 (LikeButton 컴포넌트, 나중에 구현)
  - 💬 댓글 버튼 (클릭 시 댓글 입력창 포커스 또는 모달 열기)
  - ✈️ 공유 버튼 (1차에서는 UI만, 기능 제외)
- **우측**: 
  - 🔖 북마크 버튼 (1차에서는 UI만, 기능 제외)

#### 3.5 컨텐츠 섹션
- **좋아요 수**: Bold, "좋아요 1,234개" 형식
- **캡션**: 
  - 사용자명 (Bold) + 내용
  - 2줄 초과 시 "... 더 보기" 버튼 표시
  - 클릭 시 전체 캡션 표시
- **댓글 미리보기**: 
  - 최신 2개만 표시
  - "댓글 15개 모두 보기" 링크 (클릭 시 상세 모달 열기)
  - 각 댓글: 사용자명 (Bold) + 내용

#### 3.6 스타일링
- Instagram 컬러 스키마 사용
- 배경: 흰색 (#FFFFFF)
- 테두리: #DBDBDB
- 텍스트: #262626 (본문), #8E8E8E (보조)
- 최대 너비: 630px (중앙 정렬)

### 4. components/post/PostCardSkeleton.tsx 구현

#### 4.1 Skeleton 구조
- PostCard와 동일한 레이아웃 구조
- 회색 박스로 각 섹션 표현

#### 4.2 Shimmer 효과
- CSS 애니메이션으로 shimmer 효과 구현
- Tailwind CSS의 `animate-pulse` 또는 커스텀 애니메이션

#### 4.3 구성 요소
- 헤더 Skeleton (프로필 이미지 원형 + 텍스트 박스)
- 이미지 Skeleton (정사각형)
- 액션 버튼 Skeleton (작은 박스들)
- 컨텐츠 Skeleton (여러 줄 텍스트 박스)

### 5. components/post/PostFeed.tsx 구현

#### 5.1 Props 타입 정의
```typescript
interface PostFeedProps {
  userId?: string; // 프로필 페이지용 (선택사항)
  initialPosts?: PostWithUserAndStats[];
}
```

#### 5.2 상태 관리
- `posts`: 게시물 목록
- `loading`: 로딩 상태
- `hasMore`: 더 불러올 게시물이 있는지 여부
- `offset`: 현재 오프셋

#### 5.3 무한 스크롤 구현
- **Intersection Observer API** 사용
- 하단에 감지용 요소 배치
- 하단 도달 시 다음 페이지 로드

#### 5.4 데이터 페칭
```typescript
const fetchPosts = async (reset = false) => {
  setLoading(true);
  try {
    const currentOffset = reset ? 0 : offset;
    const response = await fetch(
      `/api/posts?limit=10&offset=${currentOffset}${userId ? `&userId=${userId}` : ''}`
    );
    const { data, meta } = await response.json();
    
    if (reset) {
      setPosts(data);
    } else {
      setPosts(prev => [...prev, ...data]);
    }
    
    setOffset(currentOffset + data.length);
    setHasMore(meta.hasMore);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  } finally {
    setLoading(false);
  }
};
```

#### 5.5 렌더링
- PostCard 컴포넌트 목록 렌더링
- 로딩 중일 때 PostCardSkeleton 표시
- 더 불러올 게시물이 없을 때 메시지 표시

### 6. app/(main)/page.tsx 구현

#### 6.1 기본 구조
- PostFeed 컴포넌트 통합
- 배경색 #FAFAFA 설정
- 중앙 정렬 (최대 너비 630px)

#### 6.2 레이아웃
```tsx
<div className="min-h-screen bg-instagram-background">
  <div className="max-w-[630px] mx-auto py-4">
    <PostFeed />
  </div>
</div>
```

#### 6.3 인증 확인
- 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
- Clerk의 `auth()` 사용

## 데이터베이스 쿼리 최적화

### 7.1 효율적인 데이터 조회
- `post_stats` 뷰 활용 (likes_count, comments_count)
- JOIN 최소화
- 인덱스 활용 (`idx_posts_created_at`)

### 7.2 댓글 미리보기 조회
- PostCard에서는 최신 2개만 조회
- 별도 쿼리로 최적화:
```sql
SELECT * FROM comments 
WHERE post_id = $1 
ORDER BY created_at DESC 
LIMIT 2;
```

## 타입 정의

### 8.1 PostWithUserAndStats 타입
- `lib/types.ts`에 이미 정의됨
- Post + User + PostStats 조합

### 8.2 API 응답 타입
```typescript
interface PostsResponse {
  data: PostWithUserAndStats[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

## 스타일링 가이드

### 9.1 Instagram 컬러 사용
- `bg-instagram-background`: #FAFAFA
- `bg-instagram-card`: #FFFFFF
- `border-instagram-border`: #DBDBDB
- `text-instagram-text-primary`: #262626
- `text-instagram-text-secondary`: #8E8E8E

### 9.2 타이포그래피
- 폰트 패밀리: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- 텍스트 크기: `text-sm` (14px), `text-base` (16px)
- 폰트 굵기: `font-bold` (700), `font-semibold` (600)

### 9.3 반응형 디자인
- Desktop/Tablet: 최대 너비 630px, 중앙 정렬
- Mobile: 전체 너비

## 구현 순서

1. **API 라우트 구현** (`app/api/posts/route.ts`)
   - GET 메서드 구현
   - 페이지네이션 로직
   - 데이터베이스 쿼리 최적화

2. **PostCardSkeleton 구현** (`components/post/PostCardSkeleton.tsx`)
   - Skeleton UI 구조
   - Shimmer 애니메이션

3. **PostCard 구현** (`components/post/PostCard.tsx`)
   - 헤더 섹션
   - 이미지 섹션 (더블탭 좋아요 제외, 나중에 구현)
   - 액션 버튼 섹션 (좋아요 버튼은 나중에 구현)
   - 컨텐츠 섹션

4. **PostFeed 구현** (`components/post/PostFeed.tsx`)
   - 데이터 페칭 로직
   - 무한 스크롤 구현
   - 로딩 상태 관리

5. **홈 피드 페이지 구현** (`app/(main)/page.tsx`)
   - PostFeed 통합
   - 레이아웃 및 스타일링

## 파일 구조

```
app/
├── (main)/
│   └── page.tsx                    # 홈 피드 페이지 (새로 생성)
└── api/
    └── posts/
        └── route.ts                # 게시물 API (새로 생성)

components/
└── post/                           # 새로 생성
    ├── PostCard.tsx                # 새로 생성
    ├── PostCardSkeleton.tsx        # 새로 생성
    └── PostFeed.tsx                # 새로 생성
```

## 기술 스택

- **아이콘**: lucide-react (이미 설치됨)
- **이미지 최적화**: Next.js Image 컴포넌트
- **스타일링**: Tailwind CSS v4 (Instagram 컬러 스키마)
- **데이터 페칭**: Fetch API (또는 추후 React Query 도입 고려)
- **무한 스크롤**: Intersection Observer API

## 참고 사항

- 좋아요 기능은 별도 섹션에서 구현 (TODO.md ## 4)
- 댓글 기능은 별도 섹션에서 구현 (TODO.md ## 6)
- 게시물 상세 모달은 별도 섹션에서 구현 (TODO.md ## 7)
- 더블탭 좋아요는 모바일에서만 작동하도록 구현
- 프로필 이미지는 Clerk UserButton 또는 기본 아바타 사용

## 체크리스트

- [ ] `components/post/` 디렉토리 생성
- [ ] `app/api/posts/` 디렉토리 생성
- [ ] `app/api/posts/route.ts` 구현
  - [ ] GET 메서드 구현
  - [ ] 페이지네이션 지원 (limit, offset)
  - [ ] userId 파라미터 지원
  - [ ] 시간 역순 정렬
  - [ ] 에러 처리
- [ ] `components/post/PostCardSkeleton.tsx` 구현
  - [ ] Skeleton UI 구조
  - [ ] Shimmer 애니메이션
- [ ] `components/post/PostCard.tsx` 구현
  - [ ] 헤더 섹션 (프로필 이미지, 사용자명, 시간, 메뉴)
  - [ ] 이미지 섹션 (1:1 정사각형)
  - [ ] 액션 버튼 섹션 (좋아요, 댓글, 공유, 북마크)
  - [ ] 좋아요 수 표시
  - [ ] 캡션 (사용자명 Bold + 내용, "... 더 보기")
  - [ ] 댓글 미리보기 (최신 2개)
- [ ] `components/post/PostFeed.tsx` 구현
  - [ ] 데이터 페칭 로직
  - [ ] 무한 스크롤 (Intersection Observer)
  - [ ] 페이지네이션 (10개씩)
  - [ ] 로딩 상태 관리
  - [ ] PostCardSkeleton 통합
- [ ] `app/(main)/page.tsx` 구현
  - [ ] PostFeed 컴포넌트 통합
  - [ ] 배경색 #FAFAFA 설정
  - [ ] 중앙 정렬 (최대 630px)
  - [ ] 인증 확인

