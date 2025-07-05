'use client';

import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

import { products as allProducts, type Product } from "@/lib/placeholder-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";

export default function ProductDetailPage() {
  const params = useParams();
  const { productId } = params;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    const foundProduct = allProducts.find((p) => p.id === productId);
    if (foundProduct) {
        setProduct(foundProduct);
    } else {
        notFound();
    }
  }, [productId]);


  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1);
    }
  };
  
  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link href="/store" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/store#products" className="hover:text-primary">Products</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="truncate">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="grid gap-4">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={600}
            height={600}
            className="aspect-square object-cover border w-full rounded-lg overflow-hidden"
            data-ai-hint="product image"
          />
        </div>
        <div className="flex flex-col gap-4 py-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground mt-1">{product.category}</p>
          </div>
          <p className="text-base leading-relaxed">
            {product.description}
          </p>
          
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">Rs {product.price.toFixed(2)}</span>
            {product.stock > 0 ? (
                <Badge variant="outline">In Stock ({product.stock})</Badge>
            ) : (
                <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          <div className="mt-4">
            <Button size="lg" className="w-full md:w-auto" disabled={product.stock === 0} onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
