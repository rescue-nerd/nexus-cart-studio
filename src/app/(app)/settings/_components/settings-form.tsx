
"use client"

import { useState, useTransition } from "react"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/hooks/use-theme.tsx"
import { cn } from "@/lib/utils"
import { type Store, type Plan } from "@/lib/types"
import { CheckCircle, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast";
import { updateStorePlan, updateSeoSettings, suggestKeywordsAction, updateStoreProfile, updatePaymentSettings } from "@/app/(app)/settings/actions";
import { useTranslation } from "@/hooks/use-translation";

interface SettingsFormProps {
    store: Store;
    currentPlan?: Plan;
    allPlans: Plan[];
}

export function SettingsForm({ store, currentPlan, allPlans }: SettingsFormProps) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme()
  const { toast } = useToast();
  const router = useRouter();
  const [isPlanPending, startPlanTransition] = useTransition();
  const [isSeoPending, startSeoTransition] = useTransition();
  const [isAiPending, startAiTransition] = useTransition();
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPaymentPending, startPaymentTransition] = useTransition();
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  // SEO State
  const [metaTitle, setMetaTitle] = useState(store.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(store.metaDescription || '');
  const [metaKeywords, setMetaKeywords] = useState(store.metaKeywords || '');

  const profileFormSchema = z.object({
    name: z.string().min(2, t('zod.settings.nameLength')),
    description: z.string().optional(),
    whatsappNumber: z.string().optional(),
  });
  type ProfileFormValues = z.infer<typeof profileFormSchema>;

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: store.name || "",
      description: store.description || "",
      whatsappNumber: store.whatsappNumber || "",
    },
  });

  const paymentFormSchema = z.object({
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    branch: z.string().optional(),
    qrCode: z.instanceof(File).optional(),
    khaltiSecretKey: z.string().optional(),
    khaltiTestMode: z.boolean().default(false),
    eSewaMerchantCode: z.string().optional(),
    eSewaSecretKey: z.string().optional(),
    eSewaTestMode: z.boolean().default(false),
  });
  type PaymentFormValues = z.infer<typeof paymentFormSchema>;

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
        bankName: store.paymentSettings?.bankDetails?.bankName || "",
        accountName: store.paymentSettings?.bankDetails?.accountName || "",
        accountNumber: store.paymentSettings?.bankDetails?.accountNumber || "",
        branch: store.paymentSettings?.bankDetails?.branch || "",
        khaltiSecretKey: store.paymentSettings?.khaltiSecretKey || "",
        khaltiTestMode: store.paymentSettings?.khaltiTestMode || false,
        eSewaMerchantCode: store.paymentSettings?.eSewaMerchantCode || "",
        eSewaSecretKey: store.paymentSettings?.eSewaSecretKey || "",
        eSewaTestMode: store.paymentSettings?.eSewaTestMode || false,
    }
  });


  const onProfileSubmit = (values: ProfileFormValues) => {
    startProfileTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      formData.append('whatsappNumber', values.whatsappNumber || '');
      
      const result = await updateStoreProfile(store.id, formData);
      if (result.success) {
        toast({ title: t('settings.profile.toast.successTitle'), description: t(result.messageKey) });
      } else {
        toast({ variant: "destructive", title: t('error.genericTitle'), description: t(result.messageKey) });
      }
    });
  };

  const onPaymentSubmit = (values: PaymentFormValues) => {
    startPaymentTransition(async () => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value !== undefined) {
                if (typeof value === 'boolean') {
                    formData.append(key, value ? 'on' : 'off');
                } else if (value instanceof File) {
                    if (value.size > 0) formData.append('qrCode', value);
                }
                else {
                    formData.append(key, value);
                }
            }
        });
        const result = await updatePaymentSettings(store.id, formData);
        if (result.success) {
            toast({ title: t('settings.payments.toast.successTitle'), description: t(result.messageKey) });
        } else {
            toast({ variant: "destructive", title: t('error.genericTitle'), description: t(result.messageKey) });
        }
    });
  };

  const themes = [
    { name: 'default', label: t('settings.appearance.themes.default'), colors: ['#60A9CA', '#F0F4F8'] },
    { name: 'forest', label: t('settings.appearance.themes.forest'), colors: ['#228B22', '#F5F5DC'] },
    { name: 'ruby', label: t('settings.appearance.themes.ruby'), colors: ['#E0115F', '#FDEEF4'] },
    { name: 'amethyst', label: t('settings.appearance.themes.amethyst'), colors: ['#9966CC', '#F3F0F9'] },
    { name: 'sapphire', label: t('settings.appearance.themes.sapphire'), colors: ['#0F52BA', '#F0F8FF'] },
    { name: 'sunset', label: t('settings.appearance.themes.sunset'), colors: ['#FD5E53', '#FFF0E5'] },
    { name: 'jade', label: t('settings.appearance.themes.jade'), colors: ['#00A86B', '#F0FFF0'] },
  ];

  const handlePlanChange = (newPlanId: string) => {
    setPendingPlanId(newPlanId);
    startPlanTransition(async () => {
      const result = await updateStorePlan(store.id, newPlanId);
      if (result.success) {
        toast({
          title: t('settings.billing.toast.successTitle'),
          description: t(result.messageKey, { planName: t(`plans.${result.newPlanName}.name`) || result.newPlanName }),
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: t('error.genericTitle'),
          description: t(result.messageKey),
        });
      }
      setPendingPlanId(null);
    });
  };

  const handleSeoSave = () => {
    startSeoTransition(async () => {
      const result = await updateSeoSettings(store.id, {
        title: metaTitle,
        description: metaDescription,
        keywords: metaKeywords,
      });

      if (result.success) {
        toast({
          title: t('settings.seo.toast.successTitle'),
          description: t(result.messageKey),
        });
      } else {
        toast({
          variant: "destructive",
          title: t('error.genericTitle'),
          description: t(result.messageKey),
        });
      }
    });
  };

  const handleSuggestKeywords = () => {
    startAiTransition(async () => {
      const sourceText = store.description || metaDescription;
      if (!sourceText) {
          toast({
              variant: "destructive",
              title: t('settings.seo.toast.aiFailTitle'),
              description: t('settings.seo.toast.descriptionRequired'),
          });
          return;
      }
      const result = await suggestKeywordsAction(sourceText);

      if (result.success && result.keywords) {
        setMetaKeywords(result.keywords.join(', '));
        toast({
          title: t('settings.seo.toast.aiSuccessTitle'),
          description: t(result.messageKey),
        });
      } else {
        toast({
          variant: "destructive",
          title: t('settings.seo.toast.aiFailTitle'),
          description: t(result.messageKey),
        });
      }
    });
  }

  return (
    <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">{t('settings.tabs.profile')}</TabsTrigger>
          <TabsTrigger value="billing">{t('settings.tabs.billing')}</TabsTrigger>
          <TabsTrigger value="payments">{t('settings.tabs.payments')}</TabsTrigger>
          <TabsTrigger value="seo">{t('settings.tabs.seo')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('settings.tabs.appearance')}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.profile.title')}</CardTitle>
                  <CardDescription>
                    {t('settings.profile.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.profile.storeNameLabel')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.profile.storeDescLabel')}</FormLabel>
                         <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.profile.whatsappNumberLabel')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('settings.profile.whatsappNumberPlaceholder')} />
                        </FormControl>
                         <FormDescription>{t('settings.profile.whatsappNumberDesc')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isProfilePending}>
                    {isProfilePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('settings.saveButton')}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="billing">
            <Card>
                <CardHeader>
                    <CardTitle>{t('settings.billing.title')}</CardTitle>
                    <CardDescription>
                        {t('settings.billing.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {currentPlan && (
                        <div className="rounded-lg border bg-card text-card-foreground p-6">
                           <h3 className="text-lg font-semibold mb-2">{t('settings.billing.currentPlan')}: {t(`plans.${currentPlan.id}.name`)}</h3>
                           <p className="text-muted-foreground mb-4">{t('settings.billing.renews')}</p>
                           <ul className="space-y-2 text-sm">
                                {currentPlan.features.map(feature => (
                                    <li key={feature} className="flex items-center">
                                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                        <span>{t(`plans.features.${feature}`)}</span>
                                    </li>
                                ))}
                           </ul>
                        </div>
                    )}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {allPlans.map(plan => (
                            <Card key={plan.id} className={cn("flex flex-col", plan.id === currentPlan?.id && "border-primary ring-2 ring-primary")}>
                                <CardHeader>
                                    <CardTitle>{t(`plans.${plan.id}.name`)}</CardTitle>
                                    <CardDescription>Rs {plan.price}<span className="text-xs text-muted-foreground">/{t('settings.billing.month')}</span></CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {plan.features.map(feature => (
                                            <li key={feature} className="flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                <span>{t(`plans.features.${feature}`)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        className="w-full"
                                        disabled={isPlanPending || plan.id === currentPlan?.id}
                                        onClick={() => handlePlanChange(plan.id)}
                                    >
                                        {isPlanPending && pendingPlanId === plan.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {plan.id === currentPlan?.id ? t('settings.billing.currentPlanButton') : t('settings.billing.switchTo', { planName: t(`plans.${plan.id}.name`) })}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="payments">
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)}>
                <Card>
                <CardHeader>
                    <CardTitle>{t('settings.payments.title')}</CardTitle>
                    <CardDescription>
                        {t('settings.payments.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Online Gateways */}
                     <Card>
                        <CardHeader>
                            <CardTitle>{t('settings.payments.onlineGatewaysTitle')}</CardTitle>
                            <CardDescription>{t('settings.payments.onlineGatewaysDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 divide-y">
                            {/* Khalti Settings */}
                            <div className="pt-6 first:pt-0">
                                <h3 className="text-lg font-medium mb-4">{t('settings.payments.khaltiTitle')}</h3>
                                <div className="space-y-4">
                                <FormField
                                    control={paymentForm.control}
                                    name="khaltiSecretKey"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('settings.payments.khaltiSecretKey')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="live_secret_key_..." type="password" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={paymentForm.control}
                                    name="khaltiTestMode"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                {t('settings.payments.khaltiTestMode')}
                                            </FormLabel>
                                            <FormDescription>
                                                {t('settings.payments.khaltiTestModeDesc')}
                                            </FormDescription>
                                            </div>
                                            <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                </div>
                            </div>
                             {/* eSewa Settings */}
                            <div className="pt-6">
                                <h3 className="text-lg font-medium mb-4">{t('settings.payments.eSewaTitle')}</h3>
                                <div className="space-y-4">
                                    <FormField
                                        control={paymentForm.control}
                                        name="eSewaMerchantCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('settings.payments.eSewaMerchantCode')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="EPAYTEST" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={paymentForm.control}
                                        name="eSewaSecretKey"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('settings.payments.eSewaSecretKey')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="password" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={paymentForm.control}
                                        name="eSewaTestMode"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    {t('settings.payments.eSewaTestMode')}
                                                </FormLabel>
                                                <FormDescription>
                                                    {t('settings.payments.eSewaTestModeDesc')}
                                                </FormDescription>
                                                </div>
                                                <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Manual Methods */}
                    <Card>
                        <CardHeader>
                             <CardTitle>{t('settings.payments.manualMethodsTitle')}</CardTitle>
                            <CardDescription>{t('settings.payments.manualMethodsDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="p-6 border rounded-lg">
                                <h3 className="text-lg font-medium mb-4">{t('settings.payments.qrCodeTitle')}</h3>
                                <div className="grid md:grid-cols-2 gap-6 items-start">
                                    <FormField
                                        control={paymentForm.control}
                                        name="qrCode"
                                        render={({ field: { onChange, value, ...rest }}) => (
                                            <FormItem>
                                                <FormLabel>{t('settings.payments.uploadQr')}</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                    <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} />
                                                    </div>
                                                </FormControl>
                                                <FormDescription>{t('settings.payments.uploadQrDesc')}</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div>
                                        <FormLabel>{t('settings.payments.currentQr')}</FormLabel>
                                        <div className="mt-2 w-48 h-48 border rounded-md flex items-center justify-center bg-muted">
                                            {store.paymentSettings?.qrCodeUrl ? (
                                                <Image src={store.paymentSettings.qrCodeUrl} alt="Current QR Code" width={192} height={192} data-ai-hint="qr code"/>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">{t('settings.payments.noQr')}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border rounded-lg">
                                <h3 className="text-lg font-medium mb-4">{t('settings.payments.bankTransferTitle')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={paymentForm.control} name="bankName" render={({ field }) => (<FormItem><FormLabel>{t('settings.payments.bankName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={paymentForm.control} name="accountName" render={({ field }) => (<FormItem><FormLabel>{t('settings.payments.accountName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={paymentForm.control} name="accountNumber" render={({ field }) => (<FormItem><FormLabel>{t('settings.payments.accountNumber')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={paymentForm.control} name="branch" render={({ field }) => (<FormItem><FormLabel>{t('settings.payments.branch')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPaymentPending}>
                        {isPaymentPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('settings.saveButton')}
                    </Button>
                </CardFooter>
                </Card>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.seo.title')}</CardTitle>
              <CardDescription>
                {t('settings.seo.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <FormLabel htmlFor="meta-title">{t('settings.seo.metaTitleLabel')}</FormLabel>
                <Input id="meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
              </div>
              <div className="space-y-1">
                <FormLabel htmlFor="meta-description">{t('settings.seo.metaDescLabel')}</FormLabel>
                <Textarea id="meta-description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
              </div>
              <div className="space-y-1">
                <FormLabel htmlFor="meta-keywords">{t('settings.seo.metaKeywordsLabel')}</FormLabel>
                <div className="flex items-center gap-2">
                  <Input id="meta-keywords" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} className="flex-grow"/>
                  <Button variant="outline" size="sm" onClick={handleSuggestKeywords} disabled={isAiPending}>
                    {isAiPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                     {t('settings.seo.suggestWithAI')}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSeoSave} disabled={isSeoPending}>
                {isSeoPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('settings.saveButton')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.appearance.title')}</CardTitle>
              <CardDescription>
                {t('settings.appearance.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {themes.map((themeOption) => (
                  <div key={themeOption.name}>
                    <Button
                      variant={theme === themeOption.name ? 'default' : 'outline'}
                      className={cn(
                        "h-24 w-full justify-start p-4 flex-col items-start gap-2",
                          theme === themeOption.name && "ring-2 ring-ring"
                      )}
                      onClick={() => setTheme(themeOption.name as typeof theme)}
                    >
                        <div className="flex gap-2">
                          {themeOption.colors.map((color) => (
                            <div
                              key={color}
                              className="h-6 w-6 rounded-full border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="font-semibold">{themeOption.label}</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
  )
}
