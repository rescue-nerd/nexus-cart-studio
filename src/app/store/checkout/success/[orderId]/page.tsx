import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { orders } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2 } from 'lucide-react';

export default function OrderSuccessPage({ params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="h-24 w-24 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Thank You For Your Order!</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
            Your order has been placed successfully. You will receive an email confirmation shortly.
        </p>
        <Card className="w-full max-w-lg text-left">
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Order ID: {order.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Date</span>
                        <span>{format(new Date(order.date), "PPP")}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer</span>
                        <span>{order.customerName}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span>{order.customerEmail}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span>{order.status}</span>
                    </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>Rs {order.total.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
        <Button asChild className="mt-8">
            <Link href="/store">Continue Shopping</Link>
        </Button>
    </div>
  );
}
