"use client";

import { useState, KeyboardEvent } from "react";
import { useUser } from "@clerk/nextjs";
import type { CommentWithUser } from "@/lib/types";

/**
 * @file CommentForm.tsx
 * @description 댓글 작성 폼 컴포넌트
 *
 * Instagram 스타일의 댓글 입력 폼
 * - "댓글 달기..." placeholder
 * - Enter 키로 제출 (Shift+Enter는 줄바꿈)
 * - "게시" 버튼으로 제출
 */

interface CommentFormProps {
  postId: string;
  onSubmit?: (comment: CommentWithUser) => void; // 제출 성공 시 콜백
}

export function CommentForm({ postId, onSubmit }: CommentFormProps) {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 댓글 제출
  const handleSubmit = async () => {
    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }

    if (!content.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create comment");
      }

      const result = await response.json();
      const newComment = result.comment as CommentWithUser;

      // 입력 필드 초기화
      setContent("");

      // 콜백 호출
      if (onSubmit) {
        onSubmit(newComment);
      }
    } catch (err) {
      console.error("Error creating comment:", err);
      setError(err instanceof Error ? err.message : "댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enter 키 처리 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 로그인하지 않은 경우
  if (!user) {
    return null; // 로그인하지 않은 사용자에게는 폼을 표시하지 않음
  }

  return (
    <div className="border-t border-[var(--instagram-border)] px-4 py-3">
      {/* 에러 메시지 */}
      {error && (
        <div className="mb-2 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* 댓글 입력 폼 */}
      <div className="flex items-center gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="댓글 달기..."
          rows={1}
          className="flex-1 resize-none border-none focus:outline-none text-sm placeholder:text-[var(--instagram-text-secondary)]"
          style={{
            minHeight: "20px",
            maxHeight: "80px",
            overflow: "auto",
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className={`
            text-sm font-semibold
            ${content.trim() && !isSubmitting
              ? "text-[var(--instagram-blue)] hover:opacity-70"
              : "text-[var(--instagram-blue)]/30 cursor-not-allowed"
            }
            transition-opacity
          `}
        >
          {isSubmitting ? "게시 중..." : "게시"}
        </button>
      </div>
    </div>
  );
}

