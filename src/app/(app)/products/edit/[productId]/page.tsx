
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProduct } from "@/lib/firebase-service";
import { EditProductForm } from "./_components/edit-product-form";
import { getT } from "@/lib/translation-server";


export default async function EditProductPage({ params }: { params: { productId: string } }) {
  const { productId } = params;
  const product = await getProduct(productId);
  const t = await getT();

  const headersList = headers();
  const storeId = headersList.get('x-store-id');

  if (!product || product.storeId !== storeId) {
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
