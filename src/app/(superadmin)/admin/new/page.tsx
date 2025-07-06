
"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddStoreForm } from "./_components/add-store-form";
import { useTranslation } from "@/hooks/use-translation";

export default function NewStorePage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-2">
       <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/admin">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">{t('superadmin.newStore.back')}</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {t('superadmin.newStore.title')}
          </h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('superadmin.newStore.header')}</CardTitle>
          <CardDescription>
            {t('superadmin.newStore.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddStoreForm />
        </CardContent>
      </Card>
    </div>
  );
}
