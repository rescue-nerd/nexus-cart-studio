
'use client';

import React, { useEffect, useRef } from 'react';
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
import { placeManualOrder, initiateKhaltiPayment, initiateESewaPayment } from './actions';
import type { ESewaFormData } from './actions';
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

function ESewaRedirectForm({ formData, esewaEndpoint }: { formData: ESewaFormData; esewaEndpoint: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if (formRef.current) {
      formRef.current.submit();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-lg font-semibold">{t('storefront.checkout.redirectingToESewa')}</p>
        <p className="text-muted-foreground">{t('storefront.checkout.pleaseWait')}</p>
        <form ref={formRef} action={esewaEndpoint} method="POST">
          {Object.entries(formData).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
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
  const [esewaFormData, setEsewaFormData] = React.useState<ESewaFormData | null>(null);

  const checkoutFormSchema = z.object({
    customerName: z.string().min(2, t('zod.checkout.nameRequired')),
    customerEmail: z.string().email(t('zod.checkout.emailInvalid')),
    customerPhone: z.string().min(10, t('zod.checkout.phoneInvalid')),
    address: z.string().min(5, t('zod.checkout.addressRequired')),
    city: z.string().min(2, t('zod.checkout.cityRequired')),
    paymentMethod: z.enum(['cod', 'qr', 'bank', 'khalti', 'esewa'], {
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
      if (values.paymentMethod === 'khalti') {
          const result = await initiateKhaltiPayment(values, cartItems);
          if (result.success && result.paymentUrl) {
              clearCart();
              window.location.href = result.paymentUrl;
          } else {
              toast({
                  variant: "destructive",
                  title: t('error.genericTitle'),
                  description: result.messageKey ? t(`storefront.checkout.${result.messageKey}`) : t('error.unexpected'),
              });
          }
      } else if (values.paymentMethod === 'esewa') {
        const result = await initiateESewaPayment(values, cartItems);
        if (result.success && result.formData) {
            clearCart();
            setEsewaFormData(result.formData);
        } else {
            toast({
                variant: "destructive",
                title: t('error.genericTitle'),
                description: result.messageKey ? t(`storefront.checkout.${result.messageKey}`) : t('error.unexpected'),
            });
        }
      } else {
          const result = await placeManualOrder(values, cartItems, language);
          if (result.success) {
            clearCart();
            router.push(`/store/checkout/success/${result.orderId}`);
          } else {
            toast({
              variant: "destructive",
              title: t('error.genericTitle'),
              description: result.messageKey ? t(`storefront.checkout.${result.messageKey}`) : t('error.unexpected'),
            });
          }
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

  if (esewaFormData && store?.paymentSettings?.eSewaTestMode !== undefined) {
    const esewaEndpoint = store.paymentSettings.eSewaTestMode
      ? "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
      : "https://epay.esewa.com.np/api/epay/main/v2/form";
    return <ESewaRedirectForm formData={esewaFormData} esewaEndpoint={esewaEndpoint} />;
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
                                     {store?.paymentSettings?.eSewaMerchantCode && (
                                         <Label htmlFor="esewa" className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary">
                                            <RadioGroupItem value="esewa" id="esewa" />
                                            <svg role="img" viewBox="0 0 24 24" className="h-6 w-6"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.39 5.5h2.78v1h-2.78v-1zm4.17 10.15c0 .413-.337.75-.75.75H9.97c-.413 0-.75-.337-.75-.75V8.35c0-.413.337-.75.75-.75h1.39V6.5h-1.39c-1.023 0-1.85.827-1.85 1.85v7.3c0 1.023.827 1.85 1.85 1.85h4.06c1.023 0 1.85-.827 1.85-1.85V14.5h-1.1v1.15zM12 9.5c.276 0 .5.224.5.5v1c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-1c0-.276.224-.5.5-.5zm2.78-3h1.39c.413 0 .75.337.75.75v5.4c0 .413-.337.75-.75.75h-1.39v1h1.39c1.023 0 1.85-.827 1.85-1.85V7.25c0-1.023-.827-1.85-1.85-1.85h-1.39v1z" fill="#60BC47"/></svg>
                                            <div className="grid gap-1.5">
                                                <p className="font-semibold">{t('storefront.checkout.eSewa')}</p>
                                                <p className="text-sm text-muted-foreground">{t('storefront.checkout.eSewaDesc')}</p>
                                            </div>
                                        </Label>
                                    )}
                                    {store?.paymentSettings?.khaltiSecretKey && (
                                         <Label htmlFor="khalti" className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary">
                                            <RadioGroupItem value="khalti" id="khalti" />
                                            <svg role="img" viewBox="0 0 128 128" className="h-6 w-6"><path d="M127.32 74.12l-23.77-5.06-2.58-12.06 14.17-20.08L97.58 19.36l-19.98 14.3-11.96-2.7-5-23.85H31.11l5.03 23.8-12.03 2.6-20.1-14.2L-2.26 36.8l14.2 20.04-2.6 12.04L-23.9 74.06v29.58l23.8 5.06 2.58 12.06-14.17 20.08 17.56 17.56 20-14.3 11.94 2.73 5.02 23.8h29.53l-5.03-23.85 12.03-2.6L129.58 149l17.56-17.56-14.2-20.04 2.6-12.04 23.8-5.03zM64 100a36 36 0 110-72 36 36 0 010 72z" fill="#5D2E91"></path></svg>
                                            <div className="grid gap-1.5">
                                                <p className="font-semibold">{t('storefront.checkout.khalti')}</p>
                                                <p className="text-sm text-muted-foreground">{t('storefront.checkout.khaltiDesc')}</p>
                                            </div>
                                        </Label>
                                    )}
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
                {selectedPaymentMethod === 'khalti' ? t('storefront.checkout.proceedToKhalti') : selectedPaymentMethod === 'esewa' ? t('storefront.checkout.proceedToESewa') : t('storefront.checkout.placeOrder')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
