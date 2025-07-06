
"use client"

import { useState, useTransition } from "react"
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
import { useTheme } from "@/hooks/use-theme.tsx"
import { cn } from "@/lib/utils"
import { type Store, type Plan } from "@/lib/placeholder-data"
import { CheckCircle, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast";
import { updateStorePlan, updateSeoSettings, suggestKeywordsAction, updateStoreProfile } from "@/app/(app)/settings/actions";
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
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  // SEO State
  const [metaTitle, setMetaTitle] = useState(store.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(store.metaDescription || '');
  const [metaKeywords, setMetaKeywords] = useState(store.metaKeywords || '');

  const profileFormSchema = z.object({
    name: z.string().min(2, t('zod.settings.nameLength')),
    description: z.string().optional(),
  });
  type ProfileFormValues = z.infer<typeof profileFormSchema>;

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: store.name || "",
      description: store.description || "",
    },
  });

  const onProfileSubmit = (values: ProfileFormValues) => {
    startProfileTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      
      const result = await updateStoreProfile(store.id, formData);
      if (result.success) {
        toast({ title: t('settings.profile.toast.successTitle'), description: t(result.messageKey) });
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
          description: t(result.messageKey, { planName: result.newPlanName || '' }),
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
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.payments.title')}</CardTitle>
              <CardDescription>
                {t('settings.payments.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">eSewa</h3>
                  <p className="text-sm text-muted-foreground">{t('settings.payments.notConnected')}</p>
                </div>
                <Button variant="outline">{t('settings.payments.connectButton')}</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">Khalti</h3>
                  <p className="text-sm text-muted-foreground">{t('settings.payments.notConnected')}</p>
                </div>
                <Button variant="outline">{t('settings.payments.connectButton')}</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">IME Pay</h3>
                  <p className="text-sm text-muted-foreground">{t('settings.payments.notConnected')}</p>
                </div>
                <Button variant="outline">{t('settings.payments.connectButton')}</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button>{t('settings.saveButton')}</Button>
            </CardFooter>
          </Card>
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
                      onClick={() => setTheme(themeOption.name as any)}
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
