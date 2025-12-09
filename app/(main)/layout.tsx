import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

/**
 * @file layout.tsx
 * @description (main) Route Group 레이아웃
 *
 * Sidebar, Header, BottomNav를 통합한 반응형 레이아웃
 */

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--instagram-background)]">
      {/* Desktop/Tablet: Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-0 lg:ml-[244px]">
        {/* Mobile: Header */}
        <Header />

        {/* Main Feed */}
        <main className="flex-1 pb-[50px] md:pb-0">
          {children}
        </main>

        {/* Mobile: BottomNav */}
        <BottomNav />
      </div>
    </div>
  );
}

