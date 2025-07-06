
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { useTranslation } from "@/hooks/use-translation";
import { useStoreContext } from "@/hooks/use-store";
import { Loader2 } from "lucide-react";

export default function StorePage() {
  const { t } = useTranslation();
  const { store, products, categories, loading } = useStoreContext();
  
  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    )
  }

  if (!store) {
    return <div>Store not found.</div>;
  }

  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-headline text-primary-foreground mix-blend-multiply">
            {t('storefront.heroTitle', { storeName: store.name })}
          </h1>
          <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl mt-4 mix-blend-multiply">
            {t('storefront.heroSubtitle')}
          </p>
          <div className="mt-6">
            <Button size="lg" asChild>
              <Link href="#products">{t('storefront.shopNow')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="categories" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-8 font-headline">
            {t('storefront.collectionsTitle')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                href="#"
                key={category.id}
                className="group block rounded-lg border bg-card text-card-foreground shadow-sm p-4 text-center transition-all hover:bg-accent hover:text-accent-foreground"
              >
                <h3 className="font-semibold">{t(category.id)}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-8 font-headline">
            {t('storefront.featuredTitle')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
