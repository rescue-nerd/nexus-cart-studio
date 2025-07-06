
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

  const canConfirmOnWhatsApp = store?.whatsappNumber && store.whatsappNumber.length > 5;
  const whatsappMessage = t('storefront.orderSuccess.whatsappMessage', { storeName: store.name, orderId: order.id });
  const encodedWhatsappMessage = encodeURIComponent(whatsappMessage);

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
                {canConfirmOnWhatsApp && (
                    <Button className="flex-1 bg-[#25D366] hover:bg-[#25D366]/90" asChild>
                        <Link href={`https://wa.me/${store.whatsappNumber}?text=${encodedWhatsappMessage}`} target="_blank">
                            <svg role="img" viewBox="0 0 24 24" className="mr-2 h-5 w-5"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.46 3.49 1.32 4.95L2 22l5.25-1.38c1.41.81 3.02 1.29 4.79 1.29h.01c5.46 0 9.91-4.45 9.91-9.91c0-5.46-4.45-9.91-9.91-9.91zM12.04 20.15c-1.52 0-2.97-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31c-.82-1.28-1.26-2.8-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c4.54 0 8.24 3.7 8.24 8.24c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.14c-.25-.12-1.47-.72-1.7-.85c-.23-.12-.39-.18-.56.12c-.17.31-.64.85-.79 1.02c-.15.18-.3.2-.56.06c-.26-.12-1.1-.4-2.09-1.29c-.77-.7-1.29-1.56-1.44-1.82c-.15-.26-.02-.39.11-.51c.11-.11.25-.28.37-.42c.13-.15.17-.25.25-.42c.08-.17.04-.31-.02-.43c-.06-.12-.56-1.34-.76-1.84c-.2-.48-.4-.42-.55-.42h-.48c-.17 0-.45.06-.68.31c-.23.24-.87.85-.87 2.07c0 1.22.89 2.4 1.01 2.56c.12.17 1.76 2.68 4.26 3.76c.59.25 1.05.4 1.41.51c.59.18 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.15-1.18c-.07-.12-.23-.18-.48-.3z"></path></svg>
                            {t('storefront.orderSuccess.confirmOnWhatsApp')}
                        </Link>
                    </Button>
                )}
                <Button className="flex-1" asChild>
                    <Link href="/store#products">
                        {t('storefront.orderSuccess.continueShopping')}
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
