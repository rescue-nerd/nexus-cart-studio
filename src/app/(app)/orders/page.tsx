
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getOrdersByStore } from "@/lib/firebase-service";
import { OrdersTable } from "@/components/admin/orders-table";

export default async function OrdersPage() {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');

  if (!storeId) {
    notFound();
  }
  
  const orders = await getOrdersByStore(storeId);

  return <OrdersTable orders={orders} />;
}
