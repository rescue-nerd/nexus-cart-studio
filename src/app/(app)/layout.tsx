
"use client";

import { headers } from "next/headers";
import Link from "next/link";
import { PanelLeft, Shield } from "lucide-react";

import { NexusCartLogo } from "@/components/icons";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserNav } from "@/components/admin/user-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { stores } from "@/lib/placeholder-data";
import { useTranslation } from "@/hooks/use-translation";

// Note: This layout is a client component at the top-level because of the Sheet's state.
// We are passing a placeholder store object for demonstration as headers() is not available here.
// In a more complex app, this might be handled by a context provider populated by a server component.
const store = stores[0];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              href="/dashboard"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <NexusCartLogo className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">{store?.name || 'Nexus Cart'}</span>
            </Link>
          </nav>
          <SidebarNav store={store} />
           <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
                href="/admin"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Shield className="h-5 w-5" />
                <span className="sr-only">{t('nav.adminPanel')}</span>
              </Link>
          </nav>
        </aside>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">{t('nav.toggleMenu')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="#"
                    className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                  >
                    <NexusCartLogo className="h-5 w-5 transition-all group-hover:scale-110" />
                    <span className="sr-only">{store?.name || 'Nexus Cart'}</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <Link
                    href="/products"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {t('nav.products')}
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {t('nav.orders')}
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {t('nav.settings')}
                  </Link>
                  <Link
                    href={store ? `http://${store.domain}` : "/store"}
                    target="_blank"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {t('nav.viewStore')}
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <div className="relative ml-auto flex-1 md:grow-0">
              {/* Maybe a search bar later */}
            </div>
            <UserNav />
          </header>
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
