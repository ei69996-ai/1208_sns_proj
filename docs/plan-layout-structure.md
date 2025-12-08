# 레이아웃 구조 개발 계획

## 개요

Instagram Clone SNS 프로젝트의 레이아웃 구조를 구현합니다. Desktop, Tablet, Mobile 환경에 맞는 반응형 레이아웃을 구성합니다.

## 목표

- Next.js App Router의 Route Group을 활용한 레이아웃 구조
- 반응형 디자인 (Desktop 1024px+, Tablet 768-1023px, Mobile <768px)
- Instagram 스타일의 Sidebar, Header, BottomNav 컴포넌트 구현

## 현재 상태

- `app/layout.tsx`: Root Layout 존재 (ClerkProvider, SyncUserProvider 포함)
- `components/Navbar.tsx`: 기존 Navbar 존재 (Instagram 스타일 아님)
- `app/(main)/` Route Group: 아직 생성되지 않음
- `components/layout/` 디렉토리: 아직 생성되지 않음

## 구현 계획

### 1. 디렉토리 구조 생성

#### 1.1 Route Group 생성
- `app/(main)/` 디렉토리 생성
- 인증이 필요한 메인 페이지들을 이 그룹에 포함

#### 1.2 Layout 컴포넌트 디렉토리 생성
- `components/layout/` 디렉토리 생성
- Sidebar, Header, BottomNav 컴포넌트를 이 디렉토리에 배치

### 2. app/(main)/layout.tsx 구현

#### 2.1 기본 구조
- Root Layout의 children을 감싸는 레이아웃
- Sidebar, Header, BottomNav 통합
- 반응형 레이아웃 로직 구현

#### 2.2 레이아웃 구조
```tsx
<div className="flex min-h-screen">
  {/* Desktop/Tablet: Sidebar */}
  <Sidebar />
  
  {/* Main Content Area */}
  <div className="flex-1 flex flex-col">
    {/* Mobile: Header */}
    <Header />
    
    {/* Main Feed */}
    <main className="flex-1">
      {children}
    </main>
    
    {/* Mobile: BottomNav */}
    <BottomNav />
  </div>
</div>
```

#### 2.3 반응형 처리
- Desktop (1024px+): Sidebar 표시, Header/BottomNav 숨김
- Tablet (768-1023px): Icon-only Sidebar 표시, Header/BottomNav 숨김
- Mobile (<768px): Sidebar 숨김, Header/BottomNav 표시

### 3. components/layout/Sidebar.tsx 구현

#### 3.1 기본 구조
- 고정 위치 (왼쪽)
- 배경색: 흰색 (#FFFFFF)
- Instagram 컬러 스키마 사용

#### 3.2 Desktop 스타일 (1024px+)
- 너비: 244px (고정)
- 아이콘 + 텍스트 메뉴
- 메뉴 항목:
  - 홈 (Home icon) → `/`
  - 검색 (Search icon) → `/search` (1차 제외, UI만)
  - 만들기 (Plus icon) → 모달 열기 (CreatePostModal)
  - 프로필 (User icon) → `/profile`

#### 3.3 Tablet 스타일 (768-1023px)
- 너비: 72px (고정)
- 아이콘만 표시
- 텍스트 숨김
- 아이콘 크기: 24px

#### 3.4 Mobile 스타일 (<768px)
- 완전히 숨김 (`hidden` 또는 `display: none`)

#### 3.5 인터랙션
- Hover 효과: 배경색 변경 (#FAFAFA)
- Active 상태: 폰트 굵기 Bold (600)
- Active 표시: 현재 경로와 일치하는 메뉴 항목 강조

#### 3.6 구현 세부사항
- `usePathname()` hook으로 현재 경로 확인
- `Link` 컴포넌트로 네비게이션
- lucide-react 아이콘 사용 (Home, Search, Plus, User)
- Tailwind CSS 반응형 클래스 사용

### 4. components/layout/Header.tsx 구현

#### 4.1 기본 구조
- Mobile 전용 (768px 미만에서만 표시)
- 고정 위치 (상단)
- 높이: 60px
- 배경색: 흰색 (#FFFFFF)
- 하단 테두리: #DBDBDB

#### 4.2 구성 요소
- 좌측: 로고/브랜드명 ("Instagram" 또는 로고 이미지)
- 우측: 아이콘 버튼들
  - 알림 (Heart icon) - 1차 제외, UI만
  - DM (Send icon) - 1차 제외, UI만
  - 프로필 (UserButton from Clerk)

#### 4.3 스타일
- 중앙 정렬된 컨텐츠
- 패딩: 좌우 16px
- 아이콘 크기: 24px
- 아이콘 간격: 16px

### 5. components/layout/BottomNav.tsx 구현

#### 5.1 기본 구조
- Mobile 전용 (768px 미만에서만 표시)
- 고정 위치 (하단)
- 높이: 50px
- 배경색: 흰색 (#FFFFFF)
- 상단 테두리: #DBDBDB

#### 5.2 메뉴 항목 (5개)
- 홈 (Home icon) → `/`
- 검색 (Search icon) → `/search` (1차 제외, UI만)
- 만들기 (Plus icon) → 모달 열기
- 좋아요 (Heart icon) → `/activity` (1차 제외, UI만)
- 프로필 (User icon) → `/profile`

#### 5.3 스타일
- 5개 아이콘 균등 분배
- 아이콘 크기: 24px
- Active 상태: 아이콘 색상 변경 (검은색)
- Inactive 상태: 회색 (#8E8E8E)

#### 5.4 인터랙션
- 현재 경로와 일치하는 아이콘 강조
- 클릭 시 해당 페이지로 이동

### 6. 스타일링 및 반응형 처리

#### 6.1 Instagram 컬러 사용
- `bg-instagram-card`: 흰색 배경
- `bg-instagram-background`: #FAFAFA 배경
- `border-instagram-border`: #DBDBDB 테두리
- `text-instagram-text-primary`: #262626 텍스트
- `text-instagram-text-secondary`: #8E8E8E 텍스트

#### 6.2 반응형 브레이크포인트
- Mobile: `max-md:` (768px 미만)
- Tablet: `md:`, `lg:` (768px 이상, 1024px 미만)
- Desktop: `lg:` (1024px 이상)

#### 6.3 레이아웃 최대 너비
- Main Feed: 최대 630px (중앙 정렬)
- 배경색: #FAFAFA

### 7. 기존 컴포넌트 통합

#### 7.1 Navbar.tsx 처리
- 기존 `components/Navbar.tsx`는 제거하거나
- Instagram 스타일로 변경하거나
- `app/layout.tsx`에서 제거 (새로운 레이아웃 구조 사용)

#### 7.2 Root Layout 수정
- `app/layout.tsx`에서 기존 Navbar 제거
- (main) Route Group이 자체 레이아웃을 가지도록 설정

## 구현 순서

1. **디렉토리 구조 생성**
   - `app/(main)/` 디렉토리 생성
   - `components/layout/` 디렉토리 생성

2. **Sidebar 컴포넌트 구현**
   - 기본 구조 및 스타일
   - Desktop 스타일 (244px, 아이콘+텍스트)
   - Tablet 스타일 (72px, 아이콘만)
   - Mobile 숨김 처리
   - Active 상태 및 Hover 효과

3. **Header 컴포넌트 구현**
   - Mobile 전용 구조
   - 로고 및 아이콘 배치
   - 반응형 표시/숨김

4. **BottomNav 컴포넌트 구현**
   - Mobile 전용 구조
   - 5개 아이콘 메뉴
   - Active 상태 처리

5. **(main) Layout 구현**
   - Sidebar, Header, BottomNav 통합
   - 반응형 레이아웃 로직
   - Main Feed 영역 설정

6. **Root Layout 수정**
   - 기존 Navbar 제거 또는 수정
   - (main) Route Group과의 통합 확인

## 파일 구조

```
app/
├── layout.tsx                    # Root Layout (수정)
├── (main)/                       # Route Group (새로 생성)
│   ├── layout.tsx                # Main Layout (새로 생성)
│   ├── page.tsx                  # 홈 피드 (나중에 구현)
│   └── profile/
│       └── [userId]/
│           └── page.tsx          # 프로필 페이지 (나중에 구현)
└── ...

components/
├── layout/                       # 새로 생성
│   ├── Sidebar.tsx               # 새로 생성
│   ├── Header.tsx                # 새로 생성
│   └── BottomNav.tsx             # 새로 생성
└── Navbar.tsx                    # 제거 또는 수정
```

## 기술 스택

- **아이콘**: lucide-react (이미 설치됨)
- **스타일링**: Tailwind CSS v4 (Instagram 컬러 스키마 사용)
- **라우팅**: Next.js App Router (Route Groups)
- **인증**: Clerk (UserButton 사용)

## 참고 사항

- PRD.md의 레이아웃 구조 섹션 참고
- Instagram 웹사이트 실제 UI 참고
- 반응형 디자인은 모바일 우선 접근 방식 사용
- 접근성: 키보드 네비게이션 및 ARIA 레이블 고려

## 체크리스트

- [ ] `app/(main)/` 디렉토리 생성
- [ ] `components/layout/` 디렉토리 생성
- [ ] `components/layout/Sidebar.tsx` 구현
  - [ ] Desktop 스타일 (244px, 아이콘+텍스트)
  - [ ] Tablet 스타일 (72px, 아이콘만)
  - [ ] Mobile 숨김
  - [ ] Active 상태 및 Hover 효과
- [ ] `components/layout/Header.tsx` 구현
  - [ ] Mobile 전용 (60px 높이)
  - [ ] 로고 및 아이콘 배치
- [ ] `components/layout/BottomNav.tsx` 구현
  - [ ] Mobile 전용 (50px 높이)
  - [ ] 5개 아이콘 메뉴
  - [ ] Active 상태 처리
- [ ] `app/(main)/layout.tsx` 구현
  - [ ] Sidebar, Header, BottomNav 통합
  - [ ] 반응형 레이아웃 로직
  - [ ] Main Feed 영역 설정
- [ ] `app/layout.tsx` 수정
  - [ ] 기존 Navbar 제거 또는 수정
- [ ] 반응형 테스트
  - [ ] Desktop (1024px+) 테스트
  - [ ] Tablet (768-1023px) 테스트
  - [ ] Mobile (<768px) 테스트

