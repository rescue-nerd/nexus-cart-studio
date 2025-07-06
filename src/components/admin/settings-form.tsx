
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


interface SettingsFormProps {
    store: Store;
    currentPlan?: Plan;
    allPlans: Plan[];
}

const profileFormSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters."),
  description: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;


export function SettingsForm({ store, currentPlan, allPlans }: SettingsFormProps) {
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
        toast({ title: "Profile Updated!", description: "Your store details have been saved." });
      } else {
        toast({ variant: "destructive", title: "Update Failed", description: result.message });
      }
    });
  };

  const themes = [
    { name: 'default', label: 'Default', colors: ['#619bc9', '#f6f8fa'] },
    { name: 'forest', label: 'Forest', colors: ['#1a9a52', '#f9fafb'] },
    { name: 'ruby', label: 'Ruby', colors: ['#d62558', '#fafafa'] },
    { name: 'amethyst', label: 'Amethyst', colors: ['#8a42e2', '#f9f5ff'] },
  ];

  const handlePlanChange = (newPlanId: string) => {
    setPendingPlanId(newPlanId);
    startPlanTransition(async () => {
      const result = await updateStorePlan(store.id, newPlanId);
      if (result.success) {
        toast({
          title: "Plan Updated!",
          description: `Your store is now on the ${result.newPlanName} plan.`,
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: result.message || "An unknown error occurred.",
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
          title: "SEO Settings Saved",
          description: "Your storefront has been updated.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: result.message || "Could not save SEO settings.",
        });
      }
    });
  };

  const handleSuggestKeywords = () => {
    startAiTransition(async () => {
      // We can use the store description or meta description as a source
      const sourceText = store.description || metaDescription;
      const result = await suggestKeywordsAction(sourceText);

      if (result.success && result.keywords) {
        setMetaKeywords(result.keywords.join(', '));
        toast({
          title: "Keywords Suggested",
          description: "AI has generated new keywords based on your store description.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Suggestion Failed",
          description: result.message || "Could not get AI suggestions.",
        });
      }
    });
  }

  return (
    <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Store Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing &amp; Plan</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Store Profile</CardTitle>
                  <CardDescription>
                    Update your store's public details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
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
                        <FormLabel>Store Description</FormLabel>
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
                    Save changes
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="billing">
            <Card>
                <CardHeader>
                    <CardTitle>Billing &amp; Plan</CardTitle>
                    <CardDescription>
                        Manage your subscription and view available plans.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {currentPlan && (
                        <div className="rounded-lg border bg-card text-card-foreground p-6">
                           <h3 className="text-lg font-semibold mb-2">Current Plan: {currentPlan.name}</h3>
                           <p className="text-muted-foreground mb-4">Your plan renews next month. Price: Rs {currentPlan.price}/month.</p>
                           <ul className="space-y-2 text-sm">
                                {currentPlan.features.map(feature => (
                                    <li key={feature} className="flex items-center">
                                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                           </ul>
                        </div>
                    )}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {allPlans.map(plan => (
                            <Card key={plan.id} className={cn("flex flex-col", plan.id === currentPlan?.id && "border-primary ring-2 ring-primary")}>
                                <CardHeader>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <CardDescription>Rs {plan.price}<span className="text-xs text-muted-foreground">/month</span></CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {plan.features.map(feature => (
                                            <li key={feature} className="flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                <span>{feature}</span>
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
                                        {plan.id === currentPlan?.id ? 'Current Plan' : 'Switch to ' + plan.name}
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
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>
                Connect your payment providers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">eSewa</h3>
                  <p className="text-sm text-muted-foreground">Not Connected</p>
                </div>
                <Button variant="outline">Connect</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">Khalti</h3>
                  <p className="text-sm text-muted-foreground">Not Connected</p>
                </div>
                <Button variant="outline">Connect</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">IME Pay</h3>
                  <p className="text-sm text-muted-foreground">Not Connected</p>
                </div>
                <Button variant="outline">Connect</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Improve your store's visibility on search engines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <FormLabel htmlFor="meta-title">Meta Title</FormLabel>
                <Input id="meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
              </div>
              <div className="space-y-1">
                <FormLabel htmlFor="meta-description">Meta Description</FormLabel>
                <Textarea id="meta-description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
              </div>
              <div className="space-y-1">
                <FormLabel htmlFor="meta-keywords">Meta Keywords</FormLabel>
                <div className="flex items-center gap-2">
                  <Input id="meta-keywords" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} className="flex-grow"/>
                  <Button variant="outline" size="sm" onClick={handleSuggestKeywords} disabled={isAiPending}>
                    {isAiPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                     Suggest with AI
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSeoSave} disabled={isSeoPending}>
                {isSeoPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of your store and dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
