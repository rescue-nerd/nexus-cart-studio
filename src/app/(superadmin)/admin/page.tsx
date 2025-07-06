
"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { MoreHorizontal, PlusCircle, Power, PowerOff, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { stores, type Store } from "@/lib/placeholder-data";
import { updateStoreStatus } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [targetStatus, setTargetStatus] = useState<'Active' | 'Inactive' | 'Suspended' | null>(null);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'secondary';
      case 'Suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const handleStatusChangeClick = (store: Store, status: Store['status']) => {
    setSelectedStore(store);
    setTargetStatus(status);
    setDialogOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (!selectedStore || !targetStatus) return;

    startTransition(async () => {
      const result = await updateStoreStatus(selectedStore.id, targetStatus);
       if (result.success) {
        toast({
          title: t('superadmin.stores.toast.statusUpdated'),
          description: t('superadmin.stores.toast.statusUpdatedDesc', { name: selectedStore.name, status: targetStatus.toLowerCase() }),
        });
      } else {
        toast({
          variant: "destructive",
          title: t('superadmin.stores.toast.updateFailed'),
          description: result.message || t('superadmin.stores.toast.updateFailedDesc'),
        });
      }
      setDialogOpen(false);
      setSelectedStore(null);
      setTargetStatus(null);
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('superadmin.stores.title')}</CardTitle>
              <CardDescription>
                {t('superadmin.stores.description')}
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1" asChild>
              <Link href="/admin/new">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  {t('superadmin.stores.add')}
                </span>
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('superadmin.stores.name')}</TableHead>
                <TableHead>{t('superadmin.stores.owner')}</TableHead>
                <TableHead>{t('superadmin.stores.status')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('superadmin.stores.products')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('superadmin.stores.orders')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('superadmin.stores.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">
                    <div>{store.name}</div>
                    <div className="text-sm text-muted-foreground">{store.domain}</div>
                  </TableCell>
                  <TableCell>
                    <div>{store.ownerName}</div>
                    <div className="text-sm text-muted-foreground">{store.ownerEmail}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(store.status)}>
                      {store.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{store.productCount}</TableCell>
                  <TableCell className="hidden md:table-cell">{store.orderCount}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">{t('superadmin.stores.toggleMenu')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('superadmin.stores.actions')}</DropdownMenuLabel>
                        <DropdownMenuItem asChild><Link href={`http://${store.domain}`} target="_blank">{t('superadmin.stores.viewStorefront')}</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href={`http://${store.domain}/dashboard`} target="_blank">{t('superadmin.stores.viewDashboard')}</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {store.status === 'Active' ? (
                          <DropdownMenuItem onClick={() => handleStatusChangeClick(store, 'Inactive')}>
                            <PowerOff className="mr-2 h-4 w-4" /> {t('superadmin.stores.deactivate')}
                          </DropdownMenuItem>
                        ) : (
                           <DropdownMenuItem onClick={() => handleStatusChangeClick(store, 'Active')}>
                            <Power className="mr-2 h-4 w-4" /> {t('superadmin.stores.activate')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleStatusChangeClick(store, 'Suspended')}>
                          <PowerOff className="mr-2 h-4 w-4" /> {t('superadmin.stores.suspend')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('superadmin.stores.dialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('superadmin.stores.dialog.description', { name: selectedStore?.name, status: targetStatus })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('superadmin.stores.dialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('superadmin.stores.dialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
