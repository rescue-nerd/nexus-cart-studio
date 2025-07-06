import Image from "next/image";
import { headers } from "next/headers";
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
import { products as allProducts } from "@/lib/placeholder-data";
import { ProductActions } from "@/components/admin/product-actions";
import { ClientProductsPage } from "./_components/client-products-page";

export default function ProductsPage() {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');
  const products = allProducts.filter(p => p.storeId === storeId);

  return (
    <ClientProductsPage products={products} />
  );
}
