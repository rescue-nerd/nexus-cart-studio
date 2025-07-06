'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingCart, Banknote, QrCode, Truck, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { placeOrder } from './actions';
import type { CheckoutFormValues } from './actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTranslation } from '@/hooks/use-translation';
import { useStoreContext } from '@/hooks/use-store';

function BankDetailRow({ label, value }: { label: string, value: string | undefined }) {
  const { t } = useTranslation();
  const { toast } = useToast();

  if (!value) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({
      title: t('storefront.checkout.copied'),
      description: `${label} ${t('storefront.checkout.copiedDesc')}`,
    });
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="font-mono">{value}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy} type="button">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { store } = useStoreContext();
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const [isPending, startTransition] = React.useTransition();

  const checkoutFormSchema = z.object({
    customerName: z.string().min(2, t('zod.checkout.nameRequired')),
    customerEmail: z.string().email(t('zod.checkout.emailInvalid')),
    customerPhone: z.string().min(10, t('zod.checkout.phoneInvalid')),
    address: z.string().min(5, t('zod.checkout.addressRequired')),
    city: z.string().min(2, t('zod.checkout.cityRequired')),
    paymentMethod: z.enum(['cod', 'qr', 'bank'], {
      required_error: t('zod.checkout.paymentRequired'),
    }),
  });
  
  type FormValues = z.infer<typeof checkoutFormSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      address: '',
      city: '',
      paymentMethod: 'cod',
    },
  });

  const selectedPaymentMethod = form.watch('paymentMethod');

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await placeOrder(values, cartItems, language);

      if (result.success) {
        clearCart();
        router.push(`/store/checkout/success/${result.orderId}`);
      } else {
        toast({
          variant: "destructive",
          title: t('error.genericTitle'),
          description: result.messageKey ? t(`storefront.${result.messageKey}`) : t('error.unexpected'),
        });
      }
    });
  };

  if (cartCount === 0 && !isPending) {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col items-center justify-center text-center h-[50vh]">
            <ShoppingCart className="h-24 w-24 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('storefront.checkout.emptyCartTitle')}</h1>
            <p className="text-muted-foreground mb-6">{t('storefront.checkout.emptyCartDesc')}</p>
            <Button asChild>
                <Link href="/store#products">{t('storefront.checkout.continueShopping')}</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('storefront.checkout.title')}</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-12">
          {/* Left Side: Shipping & Payment */}
          <div className="space-y-8">
            <Card>
                <CardHeader><CardTitle>{t('storefront.checkout.shippingInfo')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="customerName" render={({ field }) => (
                        <FormItem><FormLabel>{t('storefront.checkout.fullName')}</FormLabel><FormControl><Input placeholder={t('storefront.checkout.fullNamePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid sm:grid-cols-2 gap-4">
                         <FormField control={form.control} name="customerEmail" render={({ field }) => (
                            <FormItem><FormLabel>{t('storefront.checkout.email')}</FormLabel><FormControl><Input placeholder={t('storefront.checkout.emailPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="customerPhone" render={({ field }) => (
                            <FormItem><FormLabel>{t('storefront.checkout.phone')}</FormLabel><FormControl><Input placeholder={t('storefront.checkout.phonePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>{t('storefront.checkout.address')}</FormLabel><FormControl><Input placeholder={t('storefront.checkout.addressPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>{t('storefront.checkout.city')}</FormLabel><FormControl><Input placeholder={t('storefront.checkout.cityPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>{t('storefront.checkout.paymentMethod')}</CardTitle></CardHeader>
                <CardContent>
                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid gap-4">
                                    <Label htmlFor="cod" className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary">
                                        <RadioGroupItem value="cod" id="cod" />
                                        <Truck className="h-6 w-6" />
                                        <div className="grid gap-1.5">
                                            <p className="font-semibold">{t('storefront.checkout.cod')}</p>
                                            <p className="text-sm text-muted-foreground">{t('storefront.checkout.codDesc')}</p>
                                        </div>
                                    </Label>
                                    {store?.paymentSettings?.qrCodeUrl && (
                                    <Label htmlFor="qr" className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary">
                                        <RadioGroupItem value="qr" id="qr" />
                                        <QrCode className="h-6 w-6" />
                                        <div className="grid gap-1.5">
                                            <p className="font-semibold">{t('storefront.checkout.qr')}</p>
                                            <p className="text-sm text-muted-foreground">{t('storefront.checkout.qrDesc')}</p>
                                        </div>
                                    </Label>
                                    )}
                                    {store?.paymentSettings?.bankDetails?.accountNumber && (
                                    <Label htmlFor="bank" className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary">
                                        <RadioGroupItem value="bank" id="bank" />
                                        <Banknote className="h-6 w-6" />
                                        <div className="grid gap-1.5">
                                            <p className="font-semibold">{t('storefront.checkout.bank')}</p>
                                            <p className="text-sm text-muted-foreground">{t('storefront.checkout.bankDesc')}</p>
                                        </div>
                                    </Label>
                                    )}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage className="pt-4"/>
                        </FormItem>
                    )} />
                </CardContent>
            </Card>
          </div>
          
          {/* Right Side: Order Summary */}
          <div className="space-y-8">
            <Card>
                <CardHeader><CardTitle>{t('storefront.checkout.orderSummary')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {cartItems.map(item => (
                        <div key={item.product.id} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Image src={item.product.imageUrl} alt={item.product.name} width={64} height={64} className="rounded-md border object-cover" data-ai-hint="product image"/>
                                <div>
                                    <p className="font-medium line-clamp-1">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">{t('storefront.checkout.quantity', { quantity: item.quantity })}</p>
                                </div>
                            </div>
                            <p className="font-medium text-right shrink-0">Rs {(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                    <Separator className="my-4" />
                    <div className="flex justify-between">
                        <p>{t('storefront.checkout.subtotal')}</p>
                        <p>Rs {cartTotal.toFixed(2)}</p>
                    </div>
                     <div className="flex justify-between">
                        <p>{t('storefront.checkout.shipping')}</p>
                        <p>{t('storefront.checkout.shippingCost')}</p>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <p>{t('storefront.checkout.total')}</p>
                        <p>Rs {cartTotal.toFixed(2)}</p>
                    </div>

                    {selectedPaymentMethod === 'qr' && store?.paymentSettings?.qrCodeUrl && (
                        <div className="pt-4 space-y-4">
                            <Separator />
                            <h3 className="font-semibold">{t('storefront.checkout.qrInstructionTitle')}</h3>
                            <div className="flex flex-col items-center gap-2">
                                <Image src={store.paymentSettings.qrCodeUrl} alt="QR Code for payment" width={200} height={200} className="rounded-md border" data-ai-hint="qr code"/>
                                <p className="text-sm text-muted-foreground text-center">{t('storefront.checkout.qrInstruction')}</p>
                            </div>
                        </div>
                    )}

                     {selectedPaymentMethod === 'bank' && store?.paymentSettings?.bankDetails && (
                        <div className="pt-4 space-y-2">
                            <Separator />
                            <h3 className="font-semibold">{t('storefront.checkout.bankInstructionTitle')}</h3>
                            <div className="p-4 border rounded-md space-y-2">
                                <BankDetailRow label={t('settings.payments.bankName')} value={store.paymentSettings.bankDetails.bankName} />
                                <BankDetailRow label={t('settings.payments.accountName')} value={store.paymentSettings.bankDetails.accountName} />
                                <BankDetailRow label={t('settings.payments.accountNumber')} value={store.paymentSettings.bankDetails.accountNumber} />
                                <BankDetailRow label={t('settings.payments.branch')} value={store.paymentSettings.bankDetails.branch} />
                            </div>
                            <p className="text-sm text-muted-foreground text-center">{t('storefront.checkout.bankInstruction')}</p>
                        </div>
                    )}

                </CardContent>
            </Card>
             <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {t('storefront.checkout.placeOrder')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
