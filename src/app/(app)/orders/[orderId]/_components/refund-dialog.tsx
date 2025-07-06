
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { refundKhaltiOrder } from '../../actions';

interface RefundDialogProps {
    orderId: string;
}

export function RefundDialog({ orderId }: RefundDialogProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);

    const handleRefund = () => {
        startTransition(async () => {
            const result = await refundKhaltiOrder(orderId);
            if (result.success) {
                toast({
                    title: t('orderDetails.refund.toastSuccessTitle'),
                    description: t('orderDetails.refund.refundSuccess'),
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: t('orderDetails.refund.toastErrorTitle'),
                    description: t(result.messageKey),
                });
            }
            setOpen(false);
        });
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                    <CreditCard className="mr-2 h-4 w-4"/> {t('orderDetails.refund.button')}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('orderDetails.refund.dialogTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('orderDetails.refund.dialogDescription', { orderId })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>{t('orderDetails.refund.dialogCancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRefund} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('orderDetails.refund.dialogConfirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
