
'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/use-translation';
import { getOrderAndStore } from './actions';
import { useEffect, useState } from 'react';
import type { Order, Store } from '@/lib/types';


export default function OrderSuccessPage({ params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const [order, setOrder] = useState<Order | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  
  useEffect(() => {
    async function fetchOrderData() {
        const { order: fetchedOrder, store: fetchedStore } = await getOrderAndStore(orderId);
        if (fetchedOrder) {
            setOrder(fetchedOrder);
            setStore(fetchedStore);
        }
        setLoading(false);
    }
    fetchOrderData();
  }, [orderId]);

  if (loading) {
      return (
          <div className="container mx-auto px-4 md:px-6 py-12 flex items-center justify-center h-[50vh]">
              <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
          </div>
      )
  }

  if (!order || !store) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-3xl">{t('storefront.orderSuccess.title')}</CardTitle>
          <CardDescription className="text-lg">
            {t('storefront.orderSuccess.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="text-center">
                <p className="text-muted-foreground">{t('storefront.orderSuccess.orderIdLabel')}</p>
                <p className="font-mono text-xl font-bold bg-muted rounded-md py-2">{order.id}</p>
            </div>
            <Separator />
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t('storefront.orderSuccess.summaryTitle')}</h3>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('storefront.orderSuccess.customer')}</span>
                    <span>{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('storefront.orderSuccess.paymentMethod')}</span>
                    <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('storefront.orderSuccess.shippingTo')}</span>
                    <span>{order.address}, {order.city}</span>
                </div>
                <div className="flex justify-between font-bold text-xl">
                    <span className="text-muted-foreground">{t('storefront.orderSuccess.total')}</span>
                    <span>Rs {order.total.toFixed(2)}</span>
                </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-4">
                <Button className="flex-1" asChild>
                    <Link href="/store#products">
                        {t('storefront.orderSuccess.continueShopping')}
                    </Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                    <Link href="/dashboard">
                        <Package className="mr-2 h-4 w-4" />
                        {t('storefront.orderSuccess.viewDashboard')}
                    </Link>
                </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
                {t('storefront.orderSuccess.confirmationEmail')}
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
