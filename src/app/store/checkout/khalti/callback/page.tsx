
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { verifyKhaltiPayment } from './actions';
import { useTranslation } from '@/hooks/use-translation';

function KhaltiCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { t } = useTranslation();

    useEffect(() => {
        const pidx = searchParams.get('pidx');
        const status = searchParams.get('status');

        if (!pidx) {
            toast({
                variant: 'destructive',
                title: t('error.genericTitle'),
                description: t('storefront.checkout.khaltiInvalidCallback'),
            });
            router.push('/store/checkout');
            return;
        }

        if (status && status === 'User canceled') {
             toast({
                variant: 'destructive',
                title: t('storefront.checkout.khaltiCancelledTitle'),
                description: t('storefront.checkout.khaltiCancelled'),
            });
            router.push('/store/checkout');
            return;
        }

        async function verify() {
            const result = await verifyKhaltiPayment(pidx as string);
            
            if (result.success) {
                router.push(`/store/checkout/success/${result.orderId}`);
            } else {
                 toast({
                    variant: 'destructive',
                    title: t('storefront.checkout.khaltiErrorTitle'),
                    description: t(`storefront.checkout.${result.messageKey}`),
                });
                router.push('/store/checkout');
            }
        }

        verify();

    }, [searchParams, router, toast, t]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h1 className="text-2xl font-bold">{t('storefront.checkout.verifyingPayment')}</h1>
            <p className="text-muted-foreground">{t('storefront.checkout.pleaseWait')}</p>
        </div>
    );
}

export default function KhaltiCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <KhaltiCallbackContent />
        </Suspense>
    )
}
