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
import { useTranslation } from "@/hooks/use-translation";


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
  const { t } = useTranslation();

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
          title: t('superadmin.newStore.toast.failTitle'),
          description: result.message || t('superadmin.newStore.toast.failDesc'),
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
              <FormLabel>{t('superadmin.newStore.form.storeName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('superadmin.newStore.form.storeNamePlaceholder')} {...field} />
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
                <FormLabel>{t('superadmin.newStore.form.ownerName')}</FormLabel>
                <FormControl>
                    <Input placeholder={t('superadmin.newStore.form.ownerNamePlaceholder')} {...field} />
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
                <FormLabel>{t('superadmin.newStore.form.ownerEmail')}</FormLabel>
                <FormControl>
                    <Input type="email" placeholder={t('superadmin.newStore.form.ownerEmailPlaceholder')} {...field} />
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
              <FormLabel>{t('superadmin.newStore.form.subdomain')}</FormLabel>
              <div className="flex items-center">
                 <FormControl>
                    <Input placeholder={t('superadmin.newStore.form.subdomainPlaceholder')} className="rounded-r-none" {...field} />
                </FormControl>
                <span className="h-10 flex items-center justify-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-muted-foreground text-sm">.nexuscart.com</span>
              </div>
               <FormDescription>{t('superadmin.newStore.form.subdomainDesc')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('superadmin.newStore.form.create')}
        </Button>
      </form>
    </Form>
  );
}
