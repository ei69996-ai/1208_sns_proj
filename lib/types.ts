/**
 * @file types.ts
 * @description Instagram Clone SNS 프로젝트의 TypeScript 타입 정의
 *
 * 이 파일은 Supabase 데이터베이스 스키마를 기반으로 한 타입 정의를 포함합니다.
 * 데이터베이스 테이블 구조와 뷰 구조를 TypeScript 타입으로 매핑합니다.
 *
 * @see {@link supabase/migrations/db.sql} - 데이터베이스 스키마
 */

// ============================================
// 기본 테이블 타입
// ============================================

/**
 * Users 테이블 타입
 * Clerk 인증과 연동되는 사용자 정보
 */
export interface User {
  id: string; // UUID
  clerk_id: string; // Clerk User ID
  name: string;
  created_at: string; // ISO 8601 timestamp
}

/**
 * Posts 테이블 타입
 * 게시물 정보
 */
export interface Post {
  id: string; // UUID
  user_id: string; // UUID (users.id 참조)
  image_url: string; // Supabase Storage URL
  caption: string | null; // 최대 2,200자
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Likes 테이블 타입
 * 게시물 좋아요 정보
 */
export interface Like {
  id: string; // UUID
  post_id: string; // UUID (posts.id 참조)
  user_id: string; // UUID (users.id 참조)
  created_at: string; // ISO 8601 timestamp
}

/**
 * Comments 테이블 타입
 * 댓글 정보
 */
export interface Comment {
  id: string; // UUID
  post_id: string; // UUID (posts.id 참조)
  user_id: string; // UUID (users.id 참조)
  content: string;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Follows 테이블 타입
 * 팔로우 관계 정보
 */
export interface Follow {
  id: string; // UUID
  follower_id: string; // UUID (users.id 참조) - 팔로우하는 사람
  following_id: string; // UUID (users.id 참조) - 팔로우받는 사람
  created_at: string; // ISO 8601 timestamp
}

// ============================================
// 뷰 타입 (Views)
// ============================================

/**
 * PostStats 뷰 타입
 * 게시물 통계 정보 (좋아요 수, 댓글 수)
 */
export interface PostStats {
  post_id: string; // UUID
  user_id: string; // UUID
  image_url: string;
  caption: string | null;
  created_at: string;
  likes_count: number; // 좋아요 수
  comments_count: number; // 댓글 수
}

/**
 * UserStats 뷰 타입
 * 사용자 통계 정보 (게시물 수, 팔로워 수, 팔로잉 수)
 */
export interface UserStats {
  user_id: string; // UUID
  clerk_id: string;
  name: string;
  posts_count: number; // 게시물 수
  followers_count: number; // 팔로워 수
  following_count: number; // 팔로잉 수
}

// ============================================
// 확장 타입 (Extended Types)
// ============================================

/**
 * Post + PostStats 조합 타입
 * 게시물 정보와 통계 정보를 함께 포함
 */
export interface PostWithStats extends Post {
  likes_count: number;
  comments_count: number;
}

/**
 * User + UserStats 조합 타입
 * 사용자 정보와 통계 정보를 함께 포함
 */
export interface UserWithStats extends User {
  posts_count: number;
  followers_count: number;
  following_count: number;
}

/**
 * Post + User 정보 포함 타입
 * 게시물과 작성자 정보를 함께 포함
 */
export interface PostWithUser extends Post {
  user: User;
}

/**
 * Post + User + Stats 조합 타입
 * 게시물, 작성자 정보, 통계 정보를 모두 포함
 */
export interface PostWithUserAndStats extends PostWithStats {
  user: User;
}

/**
 * Comment + User 정보 포함 타입
 * 댓글과 작성자 정보를 함께 포함
 */
export interface CommentWithUser extends Comment {
  user: User;
}

// ============================================
// API 응답 타입
// ============================================

/**
 * 페이지네이션 메타데이터
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/**
 * 페이지네이션된 응답 타입
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================
// 폼 입력 타입
// ============================================

/**
 * 게시물 생성 입력 타입
 */
export interface CreatePostInput {
  image: File;
  caption: string;
}

/**
 * 댓글 생성 입력 타입
 */
export interface CreateCommentInput {
  post_id: string;
  content: string;
}

