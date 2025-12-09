"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";

/**
 * @file CreatePostModal.tsx
 * @description 게시물 작성 모달 컴포넌트
 *
 * Instagram 스타일의 게시물 작성 모달
 * - 이미지 선택 및 미리보기
 * - 캡션 입력 (최대 2,200자)
 * - 게시물 업로드
 */

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // 업로드 성공 시 콜백
}

const MAX_CAPTION_LENGTH = 2200;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function CreatePostModal({
  open,
  onOpenChange,
  onSuccess,
}: CreatePostModalProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
      setError(null);
      setIsUploading(false);
    }
  }, [open]);

  // 미리보기 URL 정리
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("이미지 파일만 업로드할 수 있습니다. (JPEG, PNG, WebP, GIF)");
      return;
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      setError(`파일 크기는 최대 5MB까지 가능합니다. (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    setError(null);
    setSelectedFile(file);

    // 미리보기 URL 생성
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // 파일 선택 버튼 클릭
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 게시물 업로드
  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("이미지를 선택해주세요.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "게시물 업로드에 실패했습니다.");
      }

      // 성공 시 콜백 호출
      if (onSuccess) {
        onSuccess();
      }

      // 피드 새로고침 (Next.js 15 App Router)
      router.refresh();

      // 모달 닫기
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "게시물 업로드에 실패했습니다."
      );
      console.error("Error uploading post:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 py-4 border-b border-[var(--instagram-border)]">
          <DialogTitle className="text-center">새 게시물 만들기</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* 이미지 선택/미리보기 영역 */}
          <div className="mb-6">
            {previewUrl ? (
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="미리보기"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  aria-label="이미지 제거"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={handleSelectFile}
                className="relative aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--instagram-blue)] transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-sm font-semibold text-[var(--instagram-text-primary)] mb-1">
                  사진을 선택하세요
                </p>
                <p className="text-xs text-[var(--instagram-text-secondary)]">
                  최대 5MB, JPEG, PNG, WebP, GIF
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* 캡션 입력 필드 */}
          <div className="mb-6">
            <label
              htmlFor="caption"
              className="block text-sm font-semibold text-[var(--instagram-text-primary)] mb-2"
            >
              캡션
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CAPTION_LENGTH) {
                  setCaption(e.target.value);
                }
              }}
              placeholder="문구 입력..."
              rows={4}
              className="w-full px-4 py-2 border border-[var(--instagram-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--instagram-blue)] focus:border-transparent text-sm"
            />
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs ${
                  caption.length >= MAX_CAPTION_LENGTH
                    ? "text-red-500"
                    : "text-[var(--instagram-text-secondary)]"
                }`}
              >
                {caption.length}/{MAX_CAPTION_LENGTH}
              </span>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 업로드 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            className="w-full py-2 px-4 bg-[var(--instagram-blue)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "업로드 중..." : "공유"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

