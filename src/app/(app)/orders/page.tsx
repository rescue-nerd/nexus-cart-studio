import { headers } from "next/headers";
import { orders as allOrders } from "@/lib/placeholder-data";
import { OrdersTable } from "@/components/admin/orders-table";

export default function OrdersPage() {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');
  const orders = allOrders.filter(o => o.storeId === storeId);

  return <OrdersTable orders={orders} />;
}
