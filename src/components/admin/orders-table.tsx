

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { MoreHorizontal, File, Printer, Truck, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Order } from "@/lib/placeholder-data";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { updateOrderStatus } from "@/app/(app)/orders/actions";
import { useTranslation } from "@/hooks/use-translation";

export function OrdersTable({ orders }: { orders: Order[] }) {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Processing': case 'Shipped': return 'outline';
      case 'Pending': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const handleMarkAsShipped = (orderId: string) => {
    startTransition(async () => {
        const result = await updateOrderStatus(orderId, 'Shipped', language);
        if (result.success && result.status) {
            toast({ title: t('orders.toast.updatedTitle'), description: t(result.messageKey, { status: t(`orders.status.${result.status.toLowerCase()}`) }) });
        } else {
            toast({ variant: "destructive", title: t('error.genericTitle'), description: t(result.messageKey) });
        }
    });
  }

  const handleCancelClick = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedOrder) return;
    startTransition(async () => {
        const result = await updateOrderStatus(selectedOrder.id, 'Cancelled', language);
        if (result.success) {
            toast({ title: t('orders.toast.cancelledTitle'), description: t(result.messageKey) });
        } else {
            toast({ variant: "destructive", title: t('error.genericTitle'), description: t(result.messageKey) });
        }
        setDialogOpen(false);
        setSelectedOrder(null);
    });
  }


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('nav.orders')}</CardTitle>
              <CardDescription>
                {t('orders.description')}
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {t('orders.export')}
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orders.customer')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('orders.status.title')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('orders.date')}</TableHead>
                <TableHead className="text-right">{t('orders.amount')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('orders.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className={isPending ? 'opacity-50' : ''}>
                  <TableCell>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {order.customerEmail}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className="text-xs" variant={getStatusVariant(order.status)}>
                      {t(`orders.status.${order.status.toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(order.date), "PPP")}
                  </TableCell>
                  <TableCell className="text-right">Rs {order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isPending}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">{t('orders.toggleMenu')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('orders.actions')}</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/orders/${order.id}`}>{t('orders.viewDetails')}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMarkAsShipped(order.id)}>
                          <Truck className="mr-2 h-4 w-4" /> {t('orders.markAsShipped')}
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/print/receipt/${order.id}?lang=${language}`} target="_blank" rel="noopener noreferrer">
                            <Printer className="mr-2 h-4 w-4" />
                            <span>{t('orders.printReceipt')}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleCancelClick(order)}>
                          <XCircle className="mr-2 h-4 w-4" /> {t('orders.cancelOrder')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            {t('orders.footer', {start: 1, end: orders.length, total: orders.length})}
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('orders.cancelDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('orders.cancelDialog.description', { orderId: selectedOrder?.id || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('orders.cancelDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive hover:bg-destructive/90" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('orders.cancelDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
