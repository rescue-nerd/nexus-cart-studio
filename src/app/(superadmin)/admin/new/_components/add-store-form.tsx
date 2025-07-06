"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addStore } from "@/app/(superadmin)/admin/actions";


const formSchema = z.object({
  name: z.string().min(2, "Store name is required."),
  ownerName: z.string().min(2, "Owner name is required."),
  ownerEmail: z.string().email("A valid email is required."),
  domain: z.string().min(3, "Subdomain is required.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Subdomain can only contain lowercase letters, numbers, and hyphens."),
});

type FormValues = z.infer<typeof formSchema>;

export function AddStoreForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      ownerName: "",
      ownerEmail: "",
      domain: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("ownerName", values.ownerName);
      formData.append("ownerEmail", values.ownerEmail);
      formData.append("domain", values.domain);

      const result = await addStore(formData);

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: result.message || "There was a problem with your request.",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Himalayan Crafts" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="ownerName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Owner's Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Anjali Lama" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="ownerEmail"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Owner's Email</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="owner@example.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
       
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subdomain</FormLabel>
              <div className="flex items-center">
                 <FormControl>
                    <Input placeholder="himalayan-crafts" className="rounded-r-none" {...field} />
                </FormControl>
                <span className="h-10 flex items-center justify-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-muted-foreground text-sm">.nexuscart.com</span>
              </div>
               <FormDescription>This will be the public URL for the store.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Store
        </Button>
      </form>
    </Form>
  );
}
