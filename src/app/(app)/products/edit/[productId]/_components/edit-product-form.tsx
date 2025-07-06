"use client";

import { useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";

import type { Product } from "@/lib/placeholder-data";
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
import { Textarea } from "@/components/ui/textarea";
import { updateProduct, generateDescriptionAction } from "@/app/(app)/products/actions";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
  stock: z.coerce.number().int().min(0, {
    message: "Stock must be a positive integer.",
  }),
  image: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function EditProductForm({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();
  const [isAiPending, startAiTransition] = useTransition();
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
    },
  });
  
  const handleGenerateDescription = () => {
    startAiTransition(async () => {
      const productName = form.getValues("name");
      if (!productName) {
        toast({
          variant: "destructive",
          title: t('products.toast.nameRequiredTitle'),
          description: t('products.toast.nameRequiredDesc'),
        });
        return;
      }
      
      const result = await generateDescriptionAction(productName);
      
      if (result.success && result.description) {
        form.setValue("description", result.description, { shouldValidate: true });
        toast({
          title: t('products.toast.aiSuccessTitle'),
          description: t('products.toast.aiSuccessDescUpdate'),
        });
      } else {
        toast({
          variant: "destructive",
          title: t('products.toast.aiFailTitle'),
          description: t(result.messageKey),
        });
      }
    });
  };

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("price", String(values.price));
      formData.append("stock", String(values.stock));
      if (values.image) {
        formData.append("file", values.image);
      }

      const result = await updateProduct(product.id, formData);

      if (result.success) {
        // The page redirects on success, so a toast isn't necessary here,
        // but you could show one if you remove the redirect.
      } else {
        toast({
          variant: "destructive",
          title: t('error.genericTitle'),
          description: t(result.messageKey),
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('products.form.productName')}</FormLabel>
                    <FormControl>
                        <Input placeholder={t('products.form.productNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>{t('products.form.description')}</FormLabel>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        type="button" 
                        onClick={handleGenerateDescription}
                        disabled={isAiPending || !form.watch('name')}
                      >
                        {isAiPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {t('products.form.generateWithAi')}
                      </Button>
                    </div>
                    <FormControl>
                        <Textarea
                        placeholder={t('products.form.descriptionPlaceholder')}
                        className="resize-none"
                        rows={5}
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('products.form.price')}</FormLabel>
                        <FormControl>
                        <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('products.form.stock')}</FormLabel>
                        <FormControl>
                        <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
            </div>
            <div className="space-y-4">
                 <FormItem>
                    <FormLabel>{t('products.form.currentImage')}</FormLabel>
                    <div className="aspect-square rounded-md object-cover overflow-hidden border">
                        <Image src={product.imageUrl} alt={product.name} width={400} height={400} data-ai-hint="product image" />
                    </div>
                 </FormItem>
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                        <FormLabel>{t('products.form.updateImage')}</FormLabel>
                        <FormControl>
                            <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} />
                        </FormControl>
                        <FormDescription>
                           {t('products.form.updateImageDesc')}
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('products.form.saveChanges')}
        </Button>
      </form>
    </Form>
  );
}
