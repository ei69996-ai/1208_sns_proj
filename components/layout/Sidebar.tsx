"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { CreatePostModal } from "@/components/post/CreatePostModal";

/**
 * @file Sidebar.tsx
 * @description Instagram 스타일의 사이드바 컴포넌트
 *
 * Desktop: 244px 너비, 아이콘 + 텍스트
 * Tablet: 72px 너비, 아이콘만
 * Mobile: 숨김
 */

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const menuItems = [
    {
      icon: Home,
      label: "홈",
      href: "/",
    },
    {
      icon: Search,
      label: "검색",
      href: "/search", // 1차에서는 UI만
    },
    {
      icon: Plus,
      label: "만들기",
      href: "#", // 모달 열기
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setIsCreateModalOpen(true);
      },
    },
    {
      icon: User,
      label: "프로필",
      href: user ? `/profile/${user.id}` : "/sign-in",
    },
  ];

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen bg-[var(--instagram-card)] border-r border-[var(--instagram-border)] z-40">
      {/* Desktop: 244px 너비, 아이콘 + 텍스트 */}
      <div className="w-[244px] hidden lg:flex flex-col pt-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--instagram-text-primary)]">
            Instagram
          </h1>
        </div>
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isHomeActive = item.href === "/" && pathname === "/";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={item.onClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    // Link는 기본적으로 Enter 키를 처리하지만, Space 키는 명시적으로 처리
                    if (e.key === " " && item.onClick) {
                      e.preventDefault();
                      item.onClick(e as unknown as React.MouseEvent<HTMLAnchorElement>);
                    }
                  }
                }}
                aria-label={item.label}
                className={`
                  flex items-center gap-4 px-3 py-2 rounded-lg
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-[var(--instagram-blue)] focus:ring-offset-2
                  ${isActive || isHomeActive
                    ? "font-semibold text-[var(--instagram-text-primary)]"
                    : "font-normal text-[var(--instagram-text-primary)] hover:bg-[var(--instagram-background)]"
                  }
                `}
              >
                <Icon className="w-6 h-6" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tablet: 72px 너비, 아이콘만 */}
      <div className="w-[72px] flex lg:hidden flex-col items-center pt-8 px-2">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[var(--instagram-text-primary)]">
            IG
          </h1>
        </div>
        <nav className="flex flex-col gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isHomeActive = item.href === "/" && pathname === "/";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={item.onClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    // Link는 기본적으로 Enter 키를 처리하지만, Space 키는 명시적으로 처리
                    if (e.key === " " && item.onClick) {
                      e.preventDefault();
                      item.onClick(e as unknown as React.MouseEvent<HTMLAnchorElement>);
                    }
                  }
                }}
                aria-label={item.label}
                className={`
                  flex items-center justify-center w-12 h-12 rounded-lg
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-[var(--instagram-blue)] focus:ring-offset-2
                  ${isActive || isHomeActive
                    ? "bg-instagram-background"
                    : "hover:bg-instagram-background"
                  }
                `}
                title={item.label}
              >
                <Icon
                  className={`w-6 h-6 ${isActive || isHomeActive
                      ? "text-[var(--instagram-text-primary)]"
                      : "text-[var(--instagram-text-secondary)]"
                    }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 게시물 작성 모달 */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </aside>
  );
}

