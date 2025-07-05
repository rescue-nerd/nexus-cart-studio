'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { storeConfig } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingCart, MessageSquare } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

  const handleOrderOnWhatsApp = () => {
    startTransition(() => {
        const sellerPhone = storeConfig.sellerWhatsAppNumber.replace(/\D/g, '');
        
        let message = `Hello! I would like to place an order for the following items:\n\n`;
        cartItems.forEach(item => {
        message += `- ${item.product.name} (Qty: ${item.quantity}) - Rs ${(item.product.price * item.quantity).toFixed(2)}\n`;
        });
        message += `\n*Total: Rs ${cartTotal.toFixed(2)}*\n\n`;
        message += `Please confirm my order and let me know the next steps for payment and shipping.`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodedMessage}`;

        toast({
            title: "Redirecting to WhatsApp",
            description: "Your order details are being sent to the seller."
        });
        
        window.open(whatsappUrl, '_blank');
        
        clearCart();
        
        setTimeout(() => {
            router.push('/store');
        }, 500);
    });
  };

  if (cartCount === 0 && !isPending) {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col items-center justify-center text-center h-[50vh]">
            <ShoppingCart className="h-24 w-24 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild>
                <Link href="/store#products">Continue Shopping</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      <div className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {cartItems.map(item => (
                        <div key={item.product.id} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Image src={item.product.imageUrl} alt={item.product.name} width={64} height={64} className="rounded-md border object-cover" data-ai-hint="product image" />
                                <div>
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                            </div>
                            <p className="font-medium text-right">Rs {(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                <Separator className="my-6" />
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <p>Subtotal</p>
                        <p>Rs {cartTotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                        <p>Shipping</p>
                        <p>Calculated in WhatsApp</p>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <p>Total</p>
                        <p>Rs {cartTotal.toFixed(2)}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 pt-6">
                <p className="text-sm text-muted-foreground text-center">
                    Click the button below to finalize your order on WhatsApp. You will be redirected to chat with the seller.
                </p>
                <Button size="lg" className="w-full" onClick={handleOrderOnWhatsApp} disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MessageSquare className="mr-2 h-5 w-5" />}
                    Order on WhatsApp
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
