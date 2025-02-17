import { ReactNode } from "react";
import { SideNav } from "./side-nav";
import { useAuth } from "@/hooks/use-auth";

export function MainLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <SideNav />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
