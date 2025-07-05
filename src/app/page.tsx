import { Button } from "@/components/ui/button";
import { NexusCartLogo } from "@/components/icons";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40">
      <div className="text-center space-y-4">
        <NexusCartLogo className="w-24 h-24 mx-auto text-primary" />
        <h1 className="text-4xl font-bold">Welcome to GrowNexus</h1>
        <p className="text-lg text-muted-foreground">The platform for building your e-commerce empire.</p>
        <div className="flex gap-4 justify-center">
            <Button asChild>
                <Link href="/admin">Go to Superadmin</Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/login">Login to your Store</Link>
            </Button>
        </div>
      </div>
    </div>
  )
}
