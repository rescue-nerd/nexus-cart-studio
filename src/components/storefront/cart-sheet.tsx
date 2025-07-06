'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart, type CartItem } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { Trash2, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/use-translation';

function CartItemView({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useCart();
  const { t } = useTranslation();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number(e.target.value);
    if (newQuantity > 0 && newQuantity <= item.product.stock) {
      updateQuantity(item.product.id, newQuantity);
    }
  };
  
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border">
        <Image
          src={item.product.imageUrl}
          alt={item.product.name}
          fill
          sizes="80px"
          className="object-cover"
          data-ai-hint="product image"
        />
      </div>
      <div className="flex-1 space-y-1">
        <Link href={`/store/products/${item.product.id}`} className="font-semibold hover:underline">
          {item.product.name}
        </Link>
        <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              max={item.product.stock}
              value={item.quantity}
              onChange={handleQuantityChange}
              className="h-8 w-16"
              aria-label={t('storefront.cart.quantityAriaLabel')}
            />
            <span className="text-sm text-muted-foreground">x Rs {item.product.price.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <p className="font-semibold">Rs {(item.product.price * item.quantity).toFixed(2)}</p>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.product.id)}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{t('storefront.cart.removeItem')}</span>
        </Button>
      </div>
    </div>
  );
}


export function CartSheet() {
  const { cartItems, cartCount, cartTotal, clearCart } = useCart();
  const { t } = useTranslation();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0">
              {cartCount}
            </Badge>
          )}
          <span className="sr-only">{t('storefront.cart.openCart')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="pr-6">
          <SheetTitle>{t('storefront.cart.title', { count: cartCount })}</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartCount > 0 ? (
          <>
            <ScrollArea className="flex-1 pr-6 -mr-6">
              <div className="divide-y">
                {cartItems.map(item => (
                  <CartItemView key={item.product.id} item={item} />
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-4 flex-col space-y-4 text-center">
              <div className="flex justify-between font-semibold text-lg">
                <span>{t('storefront.cart.subtotal')}</span>
                <span>Rs {cartTotal.toFixed(2)}</span>
              </div>
              <Button size="lg" className="w-full" asChild>
                <Link href="/store/checkout">{t('storefront.cart.checkout')}</Link>
              </Button>
              <Button variant="outline" onClick={clearCart}>{t('storefront.cart.clearCart')}</Button>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">{t('storefront.cart.emptyTitle')}</p>
            <Button variant="outline" asChild>
                <Link href="/store#products">{t('storefront.cart.startShopping')}</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
