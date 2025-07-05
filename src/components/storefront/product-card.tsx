'use client';

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import type { Product } from "@/lib/placeholder-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent navigating to product page
    addToCart(product, 1);
  };

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
            <Button
              size="icon"
              variant="outline"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
