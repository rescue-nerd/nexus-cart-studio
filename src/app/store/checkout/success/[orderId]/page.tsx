import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Package } from 'lucide-react';
import { orders as allOrders } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function OrderSuccessPage({ params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const order = allOrders.find(o => o.id === orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-3xl">Thank You for Your Order!</CardTitle>
          <CardDescription className="text-lg">
            Your order has been placed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="text-center">
                <p className="text-muted-foreground">Your Order ID is:</p>
                <p className="font-mono text-xl font-bold bg-muted rounded-md py-2">{order.id}</p>
            </div>
            <Separator />
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Order Summary</h3>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span>{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping To:</span>
                    <span>{order.address}, {order.city}</span>
                </div>
                <div className="flex justify-between font-bold text-xl">
                    <span className="text-muted-foreground">Total:</span>
                    <span>Rs {order.total.toFixed(2)}</span>
                </div>
            </div>
            <Separator />
            <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1" asChild>
                    <Link href="/store#products">
                        Continue Shopping
                    </Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                    <Link href="/dashboard">
                        <Package className="mr-2 h-4 w-4" />
                        View My Dashboard
                    </Link>
                </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
                You will receive a confirmation email shortly. If you chose eSewa, your order will be processed after payment confirmation.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
