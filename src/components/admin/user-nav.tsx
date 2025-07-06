
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { User as FirebaseUser, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useTranslation } from "@/hooks/use-translation";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, LogOut, Settings, User as UserIcon, Loader2, Languages } from "lucide-react";


export function UserNav() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setIsLoading(false);
        });
        return () => unsubscribe();
    } else {
        // If Firebase is not configured, stop loading.
        setIsLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getInitials = (email?: string | null) => {
    if (!email) return '..';
    const parts = email.split('@');
    return parts[0].substring(0, 2).toUpperCase();
  }

  if (isLoading) {
    return (
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
    )
  }

  if (!user) {
    return (
        <Button asChild>
            <Link href="/login">{t('login.loginButton')}</Link>
        </Button>
    )
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || undefined} alt={user.email || 'User'} />
            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{t('userNav.storeOwner')}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>{t('userNav.profile')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>{t('userNav.billing')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('nav.settings')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Languages className="mr-2 h-4 w-4" />
              <span>{t('userNav.language')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as 'en' | 'ne')}>
                <DropdownMenuRadioItem value="en">{t('userNav.english')}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="ne">{t('userNav.nepali')}</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('userNav.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
