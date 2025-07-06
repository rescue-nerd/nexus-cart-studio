
'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserCircle, Truck } from "lucide-react";
import { format } from "date-fns";
import type { Order } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";


export function OrderInfoCards({ order }: { order: Order }) {
    const { t } = useTranslation();

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5"/> {t('orderDetails.shippingTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{order.address}</p>
                    <p>{order.city}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCircle className="h-5 w-5"/> {t('orderDetails.customerTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-muted-foreground">{order.customerEmail}</p>
                    <p className="text-muted-foreground">{order.customerPhone}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>{t('orderDetails.paymentTitle')}</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p><strong>{t('orderDetails.paymentMethod')}:</strong> {order.paymentMethod}</p>
                    <p><strong>{t('orderDetails.paymentDate')}:</strong> {format(new Date(order.date), "PPP p")}</p>
                    {order.paymentDetails?.transactionId && (
                        <p><strong>Transaction ID:</strong> {order.paymentDetails.transactionId}</p>
                    )}
                </CardContent>
            </Card>
        </>
    )
}
