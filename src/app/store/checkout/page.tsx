'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingCart, MessageSquare, CreditCard, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { placeOrder, checkoutFormSchema } from './actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTranslation } from '@/hooks/use-translation';

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CheckoutFormValues>({
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

  const onSubmit = (values: CheckoutFormValues) => {
    startTransition(async () => {
      const result = await placeOrder(values, cartItems);

      if (result.success) {
        clearCart();
        if (result.paymentMethod === 'whatsapp' && result.whatsappUrl) {
            toast({
                title: t('storefront.checkout.toast.redirectingToWhatsapp'),
                description: t('storefront.checkout.toast.finalizeOrder')
            });
            window.open(result.whatsappUrl, '_blank');
            router.push('/store');
        } else if (result.orderId) {
            router.push(`/store/checkout/success/${result.orderId}`);
        }
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
                                    <Label htmlFor="esewa" className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary">
                                        <RadioGroupItem value="esewa" id="esewa" />
                                        <CreditCard className="h-6 w-6" />
                                        <div className="grid gap-1.5">
                                            <p className="font-semibold">{t('storefront.checkout.esewa')}</p>
                                            <p className="text-sm text-muted-foreground">{t('storefront.checkout.esewaDesc')}</p>
                                        </div>
                                    </Label>
                                    <Label htmlFor="whatsapp" className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary">
                                        <RadioGroupItem value="whatsapp" id="whatsapp" />
                                        <MessageSquare className="h-6 w-6" />
                                        <div className="grid gap-1.5">
                                            <p className="font-semibold">{t('storefront.checkout.whatsapp')}</p>
                                            <p className="text-sm text-muted-foreground">{t('storefront.checkout.whatsappDesc')}</p>
                                        </div>
                                    </Label>
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
                                <Image src={item.product.imageUrl} alt={item.product.name} width={64} height={64} className="rounded-md border object-cover" data-ai-hint="product image" />
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
