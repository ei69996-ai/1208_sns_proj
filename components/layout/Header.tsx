"use client";

import { Heart, Send } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

/**
 * @file Header.tsx
 * @description Mobile 전용 헤더 컴포넌트
 *
 * 높이: 60px
 * 로고 + 알림/DM/프로필 아이콘
 */

export function Header() {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-[var(--instagram-card)] border-b border-[var(--instagram-border)] z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* 로고 */}
        <Link href="/" className="text-xl font-bold text-[var(--instagram-text-primary)]">
          Instagram
        </Link>

        {/* 우측 아이콘들 */}
        <div className="flex items-center gap-4">
          {/* 알림 (1차에서는 UI만) */}
          <button
            className="text-[var(--instagram-text-primary)] hover:opacity-70 transition-opacity"
            aria-label="알림"
          >
            <Heart className="w-6 h-6" />
          </button>

          {/* DM (1차에서는 UI만) */}
          <button
            className="text-[var(--instagram-text-primary)] hover:opacity-70 transition-opacity"
            aria-label="메시지"
          >
            <Send className="w-6 h-6" />
          </button>

          {/* 프로필 */}
          <UserButton />
        </div>
      </div>
    </header>
  );
}

