"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { CommentWithUser } from "@/lib/types";
import { getApiErrorMessage, getNetworkErrorMessage, isNetworkError } from "@/lib/utils/error-handler";

/**
 * @file CommentList.tsx
 * @description 댓글 목록 컴포넌트
 *
 * Instagram 스타일의 댓글 목록
 * - PostCard용: 최신 2개만 표시
 * - 상세 모달용: 전체 댓글 표시
 * - 삭제 버튼 (본인 댓글만)
 */

interface CommentListProps {
  postId: string;
  showLimit?: number; // PostCard에서 최신 2개만 표시
  currentUserId?: string; // Clerk user ID (삭제 버튼 표시용)
  onDelete?: (commentId: string) => void; // 삭제 후 콜백
}

export function CommentList({
  postId,
  showLimit,
  currentUserId,
  onDelete,
}: CommentListProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 댓글 목록 조회
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `/api/comments?postId=${postId}${showLimit ? `&limit=${showLimit}` : ""}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const result = await response.json();
        setComments(result.data || []);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("댓글을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, showLimit]);

  // 댓글 삭제
  const handleDelete = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      setDeletingId(commentId);

      const response = await fetch(`/api/comments?commentId=${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorMessage = await getApiErrorMessage(response);
        throw new Error(errorMessage);
      }

      // 댓글 목록에서 제거
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      // 콜백 호출
      if (onDelete) {
        onDelete(commentId);
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      const errorMessage = isNetworkError(err)
        ? getNetworkErrorMessage(err)
        : err instanceof Error
        ? err.message
        : "댓글 삭제에 실패했습니다.";
      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="text-sm text-[var(--instagram-text-secondary)] py-2">
        댓글을 불러오는 중...
      </div>
    );
  }

  // 에러
  if (error) {
    return (
      <div className="text-sm text-red-500 py-2">
        {error}
      </div>
    );
  }

  // 댓글이 없을 때
  if (comments.length === 0) {
    return null; // PostCard에서는 댓글이 없으면 표시하지 않음
  }

  // 표시할 댓글 (showLimit이 있으면 제한)
  const displayComments = showLimit
    ? comments.slice(-showLimit) // 최신 N개 (오름차순이므로 뒤에서)
    : comments;

  return (
    <div className="space-y-1">
      {displayComments.map((comment) => {
        const isOwnComment = currentUserId && comment.user.clerk_id === currentUserId;

        return (
          <div
            key={comment.id}
            className="flex items-start gap-2 group"
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm">
                <Link
                  href={`/profile/${comment.user.clerk_id}`}
                  className="font-semibold text-[var(--instagram-text-primary)] hover:opacity-70 mr-2"
                >
                  {comment.user.name}
                </Link>
                <span className="text-[var(--instagram-text-primary)]">
                  {comment.content}
                </span>
              </span>
            </div>

            {/* 삭제 버튼 (본인 댓글만) */}
            {isOwnComment && (
              <button
                onClick={() => handleDelete(comment.id)}
                disabled={deletingId === comment.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--instagram-text-secondary)] hover:text-red-500 disabled:opacity-50"
                aria-label="댓글 삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

