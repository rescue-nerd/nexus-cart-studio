
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, File, CreditCard } from 'lucide-react';
import { getOrder, getStore } from '@/lib/firebase-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { getT } from '@/lib/translation-server';
import type { Order } from '@/lib/types';
import { OrderSummaryCard } from './_components/order-summary-card';
import { OrderInfoCards } from './_components/order-info-cards';
import { RefundDialog } from './_components/refund-dialog';

export default async function OrderDetailsPage({ params, searchParams }: { params: { orderId: string }, searchParams: { lang: 'en' | 'ne' } }) {
  const orderId = params.orderId as string;
  const lang = searchParams.lang || 'en';
  const t = await getT(lang);

  const order = await getOrder(orderId);
  
  if (!order) {
    notFound();
  }
  
  const store = await getStore(order.storeId);
  const canBeRefunded = order.paymentMethod === 'Khalti' && !!order.paymentDetails?.transactionId && order.status !== 'Refunded' && order.status !== 'Cancelled';

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
          <div className="flex items-center gap-2">
            {canBeRefunded && <RefundDialog orderId={order.id} />}
            <Button size="sm" variant="outline">
                <File className="mr-2 h-4 w-4"/> {t('orderDetails.invoice')}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <OrderSummaryCard order={order} />
            </div>

            <div className="space-y-6">
                 <OrderInfoCards order={order} />
            </div>
        </div>
    </div>
  );
}
