
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Separator } from '@/components/ui/separator';
import type { Order } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';

const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Processing': case 'Shipped': return 'outline';
      case 'Pending': return 'secondary';
      case 'Cancelled': case 'Failed': return 'destructive';
      case 'Refunded': return 'destructive';
      default: return 'default';
    }
};

export function OrderSummaryCard({ order }: { order: Order }) {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{t('orderDetails.summaryTitle')}</span>
                        <Badge className="text-sm" variant={getStatusVariant(order.status)}>
                        {t(`orders.status.${order.status.toLowerCase()}`)}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                        {order.items.map((item) => (
                        <div key={item.productId} className="flex justify-between items-center">
                            <p>{item.productName} <span className="text-muted-foreground">x {item.quantity}</span></p>
                            <p>Rs {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                        <p>{t('orderDetails.total')}</p>
                        <p>Rs {order.total.toFixed(2)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
