
"use client";

import Image from "next/image";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductActions } from "@/components/admin/product-actions";
import { useTranslation } from "@/hooks/use-translation";
import type { Product } from "@/lib/types";

export function ClientProductsPage({ products }: { products: Product[] }) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("products.title")}</CardTitle>
            <CardDescription>{t("products.description")}</CardDescription>
          </div>
          <Button size="sm" className="gap-1" asChild>
            <Link href="/products/new">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {t("products.addProduct")}
              </span>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">{t("products.image")}</span>
              </TableHead>
              <TableHead>{t("products.name")}</TableHead>
              <TableHead>{t("products.status")}</TableHead>
              <TableHead>{t("products.price")}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t("products.stock")}
              </TableHead>
              <TableHead>
                <span className="sr-only">{t("products.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt="Product image"
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={product.imageUrl}
                    width="64"
                    data-ai-hint="product image"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                    {product.stock > 0
                      ? t("products.inStock")
                      : t("products.outOfStock")}
                  </Badge>
                </TableCell>
                <TableCell>Rs {product.price.toFixed(2)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.stock}
                </TableCell>
                <TableCell className="text-right">
                  <ProductActions productId={product.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          {t("products.footer", {
            start: products.length > 0 ? 1 : 0,
            end: products.length,
            total: products.length,
          })}
        </div>
      </CardFooter>
    </Card>
  );
}
