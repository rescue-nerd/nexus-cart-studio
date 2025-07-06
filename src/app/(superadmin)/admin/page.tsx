
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

export default function SuperAdminDashboard() {
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
          title: "Status Updated",
          description: `Store "${selectedStore.name}" has been ${targetStatus.toLowerCase()}.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: result.message || "Could not update store status.",
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
              <CardTitle>All Stores</CardTitle>
              <CardDescription>
                Manage all stores on the platform.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1" asChild>
              <Link href="/admin/new">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add New Store
                </span>
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Products</TableHead>
                <TableHead className="hidden md:table-cell">Orders</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
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
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild><Link href={`http://${store.domain}`} target="_blank">View Storefront</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href={`http://${store.domain}/dashboard`} target="_blank">View Dashboard</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {store.status === 'Active' ? (
                          <DropdownMenuItem onClick={() => handleStatusChangeClick(store, 'Inactive')}>
                            <PowerOff className="mr-2 h-4 w-4" /> Deactivate
                          </DropdownMenuItem>
                        ) : (
                           <DropdownMenuItem onClick={() => handleStatusChangeClick(store, 'Active')}>
                            <Power className="mr-2 h-4 w-4" /> Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleStatusChangeClick(store, 'Suspended')}>
                          <PowerOff className="mr-2 h-4 w-4" /> Suspend
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will change the status of the store '{selectedStore?.name}' to '{targetStatus}'. 
              The store owner may be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
