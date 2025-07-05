"use client"

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
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { name: 'default', label: 'Default', colors: ['#619bc9', '#f6f8fa'] },
    { name: 'forest', label: 'Forest', colors: ['#1a9a52', '#f9fafb'] },
    { name: 'ruby', label: 'Ruby', colors: ['#d62558', '#fafafa'] },
    { name: 'amethyst', label: 'Amethyst', colors: ['#8a42e2', '#f9f5ff'] },
  ]

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-2">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Store Profile</TabsTrigger>
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
                <Input id="name" defaultValue="My Nepali Bazaar" />
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
    </div>
  )
}
