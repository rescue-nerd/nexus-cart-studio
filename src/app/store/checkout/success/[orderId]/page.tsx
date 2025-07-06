
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

  const whatsappUrl = store.whatsappNumber
    ? `https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        t('storefront.orderSuccess.whatsappMessage', { orderId: order.id, storeName: store.name })
      )}`
    : '';

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
                {store.whatsappNumber && (
                    <Button variant="default" className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white" asChild>
                        <Link href={whatsappUrl} target="_blank">
                            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="mr-2 h-4 w-4">
                                <title>WhatsApp</title>
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            {t('storefront.orderSuccess.confirmOnWhatsApp')}
                        </Link>
                    </Button>
                )}
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
