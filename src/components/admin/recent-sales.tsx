import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { orders } from "@/lib/placeholder-data";

export function RecentSales() {
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {recentOrders.map((order) => (
        <div className="flex items-center" key={order.id}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={`/avatars/${order.id.slice(-1)}.png`} alt="Avatar" />
            <AvatarFallback>{order.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">
              {order.customerEmail}
            </p>
          </div>
          <div className="ml-auto font-medium">+{`Rs ${order.total.toFixed(2)}`}</div>
        </div>
      ))}
    </div>
  );
}
