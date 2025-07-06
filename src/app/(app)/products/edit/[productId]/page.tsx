"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { products as allProducts } from "@/lib/placeholder-data";
import { EditProductForm } from "./_components/edit-product-form";
import { useTranslation } from "@/hooks/use-translation";


export default function EditProductPage({ params }: { params: { productId: string } }) {
  const { productId } = params;
  const product = allProducts.find((p) => p.id === productId);
  const { t } = useTranslation();

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-2">
       <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/products">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">{t('products.form.back')}</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {t('products.edit.title')}
          </h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('products.edit.header')}</CardTitle>
          <CardDescription>
            {t('products.edit.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditProductForm product={product} />
        </CardContent>
      </Card>
    </div>
  );
}
