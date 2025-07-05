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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/products", icon: Package, label: "Products" },
  { href: "/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/store", icon: Store, label: "View Store" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
      {navItems.map((item) => (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                pathname.startsWith(item.href) && item.href !== '/store' && "bg-accent text-accent-foreground",
                pathname === '/store' && item.href === '/store' && "bg-accent text-accent-foreground"
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
