"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast";
import { updateStorePlan } from "@/app/(app)/settings/actions";


interface SettingsFormProps {
    store: Store;
    currentPlan?: Plan;
    allPlans: Plan[];
}

export function SettingsForm({ store, currentPlan, allPlans }: SettingsFormProps) {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  const themes = [
    { name: 'default', label: 'Default', colors: ['#619bc9', '#f6f8fa'] },
    { name: 'forest', label: 'Forest', colors: ['#1a9a52', '#f9fafb'] },
    { name: 'ruby', label: 'Ruby', colors: ['#d62558', '#fafafa'] },
    { name: 'amethyst', label: 'Amethyst', colors: ['#8a42e2', '#f9f5ff'] },
  ];

  const handlePlanChange = (newPlanId: string) => {
    setPendingPlanId(newPlanId);
    startTransition(async () => {
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
          <Card>
            <CardHeader>
              <CardTitle>Store Profile</CardTitle>
              <CardDescription>
                Update your store's public details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Store Name</Label>
                <Input id="name" defaultValue={store.name} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Store Description</Label>
                <Textarea id="description" defaultValue="The best handcrafted goods from the Himalayas." />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
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
                                        disabled={isPending || plan.id === currentPlan?.id}
                                        onClick={() => handlePlanChange(plan.id)}
                                    >
                                        {isPending && pendingPlanId === plan.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input id="meta-title" defaultValue="My Nepali Bazaar - Authentic Himalayan Goods" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea id="meta-description" defaultValue="Shop for authentic, handcrafted arts, apparel, and spices from Nepal. Support local artisans." />
              </div>
              <div className="space-y-1">
                <Label htmlFor="meta-keywords">Meta Keywords</Label>
                <Input id="meta-keywords" defaultValue="nepali goods, himalayan art, pashmina, singing bowls, thangka" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
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
