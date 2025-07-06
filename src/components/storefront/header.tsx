'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { NexusCartLogo } from "@/components/icons";
import { Search, User, Menu, Languages } from "lucide-react";
import { CartSheet } from "./cart-sheet";
import { useTranslation } from "@/hooks/use-translation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Header({ storeName }: { storeName: string }) {
  const { t, language, setLanguage } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/store" className="mr-6 flex items-center space-x-2">
            <NexusCartLogo className="h-6 w-6 text-primary" />
            <span className="font-bold">{storeName}</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/store#categories"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t('nav.categories')}
            </Link>
            <Link
              href="/store#products"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t('nav.products')}
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t('nav.about')}
            </Link>
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">{t('nav.toggleMenu')}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <Link href="/store" className="mr-6 flex items-center space-x-2">
              <NexusCartLogo className="h-6 w-6 text-primary" />
              <span className="font-bold">{storeName}</span>
            </Link>
            <div className="divide-y divide-border">
              <nav className="grid gap-2 py-6">
                <Link href="/store#categories" className="flex w-full items-center py-2 text-lg font-semibold">{t('nav.categories')}</Link>
                <Link href="/store#products" className="flex w-full items-center py-2 text-lg font-semibold">{t('nav.products')}</Link>
                <Link href="#" className="flex w-full items-center py-2 text-lg font-semibold">{t('nav.about')}</Link>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/login">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
                <span className="sr-only">{t('userNav.language')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')} disabled={language === 'en'}>
                {t('userNav.english')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ne')} disabled={language === 'ne'}>
                {t('userNav.nepali')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <CartSheet />
        </div>
      </div>
    </header>
  );
}
