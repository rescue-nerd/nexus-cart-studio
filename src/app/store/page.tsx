import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { categories, products as allProducts, stores } from "@/lib/placeholder-data";
import { AIChat } from "@/components/storefront/ai-chat";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { notFound } from "next/navigation";

function ProductCard({ product }: { product: typeof allProducts[0] }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="p-0">
        <Image
          src="https://placehold.co/600x400.png"
          alt={product.name}
          width={600}
          height={400}
          className="object-cover"
          data-ai-hint="product image"
        />
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xl font-bold">Rs {product.price.toFixed(2)}</p>
          <Button>Add to Cart</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StorePage() {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');
  const store = stores.find(s => s.id === storeId);
  
  if (!store) {
    // This will render the not-found.tsx file if it exists, or a default Next.js 404 page.
    notFound();
  }

  const products = allProducts.filter(p => p.storeId === storeId);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header storeName={store.name} />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-headline text-primary-foreground mix-blend-multiply">
              Discover the Soul of Nepal at {store.name}
            </h1>
            <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl mt-4 mix-blend-multiply">
              Authentic, handcrafted treasures from the heart of the Himalayas.
            </p>
            <div className="mt-6">
              <Button size="lg">Shop Now</Button>
            </div>
          </div>
        </section>

        <section id="categories" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-8 font-headline">
              Our Collections
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  href="#"
                  key={category.id}
                  className="group block rounded-lg border bg-card text-card-foreground shadow-sm p-4 text-center transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  <h3 className="font-semibold">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="products" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-8 font-headline">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer storeName={store.name} />
      <AIChat />
    </div>
  );
}
