
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, File, Package, UserCircle, Truck } from 'lucide-react';
import { getOrder, getStore } from '@/lib/firebase-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { getT } from '@/lib/translation-server';
import type { Order } from '@/lib/types';


const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Processing': case 'Shipped': return 'outline';
      case 'Pending': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
};

export default async function OrderDetailsPage({ params, searchParams }: { params: { orderId: string }, searchParams: { lang: 'en' | 'ne' } }) {
  const orderId = params.orderId as string;
  const lang = searchParams.lang || 'en';
  const t = await getT(lang);

  const order = await getOrder(orderId);
  
  if (!order) {
    notFound();
  }
  
  const store = await getStore(order.storeId);

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/orders">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">{t('orderDetails.back')}</span>
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-xl">{t('orderDetails.title')}</h1>
            <p className="text-sm text-muted-foreground">
                {t('orderDetails.orderId', { orderId: order.id })}
            </p>
          </div>
          <Button size="sm" variant="outline">
            <File className="mr-2 h-4 w-4"/> {t('orderDetails.invoice')}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
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

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5"/> {t('orderDetails.shippingTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{order.address}</p>
                        <p>{order.city}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
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
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
