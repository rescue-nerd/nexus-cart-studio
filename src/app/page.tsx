
"use client";

import { Button } from "@/components/ui/button";
import { NexusCartLogo } from "@/components/icons";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40">
      <div className="text-center space-y-4">
        <NexusCartLogo className="w-24 h-24 mx-auto text-primary" />
        <h1 className="text-4xl font-bold">{t('home.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('home.subtitle')}</p>
        <div className="flex gap-4 justify-center">
            <Button asChild>
                <Link href="/admin">{t('home.superadminButton')}</Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/login">{t('home.loginButton')}</Link>
            </Button>
        </div>
      </div>
    </div>
  )
}
