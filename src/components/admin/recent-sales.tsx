
'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { getRecentOrders } from "@/lib/firebase-service";
import type { Order } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function RecentSalesSkeleton() {
  return (
    <div className="space-y-8">
      {[...Array(3)].map((_, i) => (
        <div className="flex items-center" key={i}>
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="ml-4 space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <Skeleton className="ml-auto h-4 w-[50px]" />
        </div>
      ))}
    </div>
  )
}

export function RecentSales({ storeId, noSalesMessage }: { storeId: string, noSalesMessage: string }) {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentOrders() {
      setIsLoading(true);
      const orders = await getRecentOrders(storeId, 5);
      setRecentOrders(orders);
      setIsLoading(false);
    }
    fetchRecentOrders();
  }, [storeId]);


  if (isLoading) {
    return <RecentSalesSkeleton />;
  }

  if (recentOrders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        {noSalesMessage}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {recentOrders.map((order) => (
        <div className="flex items-center" key={order.id}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://i.pravatar.cc/40?u=${order.customerEmail}`} alt="Avatar" />
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
