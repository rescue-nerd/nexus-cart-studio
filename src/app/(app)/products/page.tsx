
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getProductsByStore } from "@/lib/firebase-service";
import { ClientProductsPage } from "./_components/client-products-page";

export default async function ProductsPage() {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');

  if (!storeId) {
    notFound();
  }
  
  const products = await getProductsByStore(storeId);

  return (
    <ClientProductsPage products={products} />
  );
}
