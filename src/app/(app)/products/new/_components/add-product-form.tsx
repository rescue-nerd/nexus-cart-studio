"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";

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
import { addProduct, generateDescriptionAction } from "@/app/(app)/products/actions";
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
  image: z.instanceof(File).refine((file) => file.size > 0, "An image is required."),
});

type FormValues = z.infer<typeof formSchema>;

export function AddProductForm() {
  const [isPending, startTransition] = useTransition();
  const [isAiPending, startAiTransition] = useTransition();
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      image: new File([], ""),
    },
  });
  
  const handleGenerateDescription = () => {
    startAiTransition(async () => {
      const productName = form.getValues("name");
      if (!productName) {
        toast({
          variant: "destructive",
          title: t('products.toast.nameRequired'),
          description: t('products.toast.nameRequiredDesc'),
        });
        return;
      }
      
      const result = await generateDescriptionAction(productName);
      
      if (result.success && result.description) {
        form.setValue("description", result.description, { shouldValidate: true });
        toast({
          title: t('products.toast.aiSuccessTitle'),
          description: t('products.toast.aiSuccessDescAdd'),
        });
      } else {
        toast({
          variant: "destructive",
          title: t('products.toast.aiFailTitle'),
          description: result.message || t('products.toast.aiFailDesc'),
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
      formData.append("file", values.image);

      const result = await addProduct(formData);

      if (result.success) {
        toast({
          title: t('products.toast.addSuccessTitle'),
          description: t('products.toast.addSuccessDesc', { name: values.name }),
        });
      } else {
        toast({
          variant: "destructive",
          title: t('products.toast.failTitle'),
          description: result.message || t('products.toast.failDesc'),
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
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>{t('products.form.productImage')}</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} />
              </FormControl>
               <FormDescription>
                {t('products.form.productImageDesc')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('products.addProduct')}
        </Button>
      </form>
    </Form>
  );
}
