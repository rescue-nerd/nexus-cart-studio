import { headers } from "next/headers";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, File, Package, UserCircle, Truck } from 'lucide-react';
import { orders as allOrders, products as allProducts, stores } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';


// In a real app, you would fetch this from your database based on the order details
const getOrderItems = (orderId: string) => {
    if (orderId.endsWith('1')) return [{ product: allProducts.find(p => p.id === 'prod_002')!, quantity: 1 }];
    if (orderId.endsWith('2')) return [{ product: allProducts.find(p => p.id === 'prod_001')!, quantity: 1 }];
    if (orderId.endsWith('3')) return [{ product: allProducts.find(p => p.id === 'prod_003')!, quantity: 2 }];
    if (orderId.endsWith('4')) return [{ product: allProducts.find(p => p.id === 'prod_004')!, quantity: 1 }];
    return [{ product: allProducts.find(p => p.id === 'prod_005')!, quantity: 1 }];
}

const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Processing': case 'Shipped': return 'outline';
      case 'Pending': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
};

export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const order = allOrders.find(o => o.id === orderId);
  const headersList = headers();
  const storeId = headersList.get('x-store-id');
  const store = stores.find(s => s.id === storeId);

  if (!order || order.storeId !== storeId) {
    notFound();
  }

  const orderItems = getOrderItems(order.id);

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/orders">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back to Orders</span>
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-xl">Order Details</h1>
            <p className="text-sm text-muted-foreground">
                Order ID: {order.id}
            </p>
          </div>
          <Button size="sm" variant="outline">
            <File className="mr-2 h-4 w-4"/> Invoice
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Order Summary</span>
                             <Badge className="text-sm" variant={getStatusVariant(order.status)}>
                                {order.status}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                             {orderItems.map(({ product, quantity }) => (
                                <div key={product.id} className="flex justify-between items-center">
                                    <p>{product.name} <span className="text-muted-foreground">x {quantity}</span></p>
                                    <p>Rs {(product.price * quantity).toFixed(2)}</p>
                                </div>
                             ))}
                             <Separator />
                              <div className="flex justify-between font-semibold">
                                <p>Total</p>
                                <p>Rs {order.total.toFixed(2)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5"/> Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{order.address}</p>
                        <p>{order.city}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UserCircle className="h-5 w-5"/> Customer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-muted-foreground">{order.customerEmail}</p>
                        <p className="text-muted-foreground">{order.customerPhone}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        <p><strong>Method:</strong> {order.paymentMethod}</p>
                        <p><strong>Date:</strong> {format(new Date(order.date), "PPP p")}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
