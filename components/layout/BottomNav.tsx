"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Heart, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { CreatePostModal } from "@/components/post/CreatePostModal";

/**
 * @file BottomNav.tsx
 * @description Mobile 전용 하단 네비게이션 컴포넌트
 *
 * 높이: 50px
 * 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
 */

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const menuItems = [
    {
      icon: Home,
      href: "/",
      label: "홈",
    },
    {
      icon: Search,
      href: "/search", // 1차에서는 UI만
      label: "검색",
    },
    {
      icon: Plus,
      href: "#", // 모달 열기
      label: "만들기",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setIsCreateModalOpen(true);
      },
    },
    {
      icon: Heart,
      href: "/activity", // 1차에서는 UI만
      label: "좋아요",
    },
    {
      icon: User,
      href: user ? `/profile/${user.id}` : "/sign-in",
      label: "프로필",
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-[var(--instagram-card)] border-t border-[var(--instagram-border)] z-50">
      <div className="flex items-center justify-around h-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isHomeActive = item.href === "/" && pathname === "/";

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.onClick}
              className={`
                flex items-center justify-center w-12 h-12
                transition-colors duration-200
                ${
                  isActive || isHomeActive
                    ? "text-[var(--instagram-text-primary)]"
                    : "text-[var(--instagram-text-secondary)]"
                }
              `}
              aria-label={item.label}
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
          })}
      </div>

      {/* 게시물 작성 모달 */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </nav>
  );
}

