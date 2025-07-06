
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { verifyESewaPayment } from './actions';
import { useTranslation } from '@/hooks/use-translation';

function ESewaCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { t } = useTranslation();

    useEffect(() => {
        const data = searchParams.get('data');

        if (!data) {
            toast({
                variant: 'destructive',
                title: t('error.genericTitle'),
                description: t('storefront.checkout.eSewaInvalidCallback'),
            });
            router.push('/store/checkout');
            return;
        }

        async function verify() {
            const result = await verifyESewaPayment(data);
            
            if (result.success && result.orderId) {
                router.push(`/store/checkout/success/${result.orderId}`);
            } else {
                 toast({
                    variant: 'destructive',
                    title: t('storefront.checkout.eSewaErrorTitle'),
                    description: result.messageKey ? t(`storefront.checkout.${result.messageKey}`) : t('error.unexpected'),
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

export default function ESewaCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ESewaCallbackContent />
        </Suspense>
    )
}
