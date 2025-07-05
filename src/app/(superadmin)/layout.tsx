import { NexusCartLogo } from "@/components/icons";
import { UserNav } from "@/components/admin/user-nav";
import Link from "next/link";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-semibold"
          >
            <NexusCartLogo className="h-6 w-6" />
            <span>GrowNexus Admin</span>
          </Link>
          <div className="relative ml-auto flex-1 md:grow-0">
            {/* Search can go here later */}
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 md:p-6">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
