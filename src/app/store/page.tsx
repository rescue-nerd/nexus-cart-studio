import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { categories, products as allProducts, stores } from "@/lib/placeholder-data";
import { notFound } from "next/navigation";

function ProductCard({ product }: { product: typeof allProducts[0] }) {
  return (
    <Link href={`/store/products/${product.id}`} className="group block h-full">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={600}
              height={400}
              className="object-cover w-full h-auto aspect-square transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="product image"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold line-clamp-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xl font-bold">Rs {product.price.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function StorePage() {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');
  const store = stores.find(s => s.id === storeId);
  
  if (!store) {
    notFound();
  }

  const products = allProducts.filter(p => p.storeId === storeId);

  return (
    <>
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
    </>
  );
}
