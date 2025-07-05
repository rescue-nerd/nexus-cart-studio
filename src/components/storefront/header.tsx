import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { NexusCartLogo } from "@/components/icons";
import { Search, ShoppingCart, User, Menu } from "lucide-react";

export function Header({ storeName }: { storeName: string }) {
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
              href="#categories"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Categories
            </Link>
            <Link
              href="#products"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Products
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              About
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
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <Link href="/store" className="mr-6 flex items-center space-x-2">
              <NexusCartLogo className="h-6 w-6 text-primary" />
              <span className="font-bold">{storeName}</span>
            </Link>
            <div className="divide-y divide-border">
              <nav className="grid gap-2 py-6">
                <Link href="#categories" className="flex w-full items-center py-2 text-lg font-semibold">Categories</Link>
                <Link href="#products" className="flex w-full items-center py-2 text-lg font-semibold">Products</Link>
                <Link href="#" className="flex w-full items-center py-2 text-lg font-semibold">About</Link>
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
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
