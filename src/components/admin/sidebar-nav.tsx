"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Store,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Store as StoreType } from "@/lib/placeholder-data";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "@/hooks/use-translation";

export function SidebarNav({ store }: { store?: StoreType }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t('nav.dashboard') },
    { href: "/products", icon: Package, label: t('nav.products') },
    { href: "/orders", icon: ShoppingCart, label: t('nav.orders') },
    { href: "/settings", icon: Settings, label: t('nav.settings') },
    { href: store ? `http://${store.domain}` : '/store', icon: Store, label: t('nav.viewStore'), target: "_blank" },
  ];

  return (
    <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
      {navItems.map((item) => (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              target={item.target || '_self'}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                 // The store link is external, so we don't want to highlight it as active.
                item.target !== '_blank' && pathname.startsWith(item.href) && "bg-accent text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="sr-only">{item.label}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      ))}
    </nav>
  );
}
