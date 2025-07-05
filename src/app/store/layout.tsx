import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { stores } from "@/lib/placeholder-data";
import { AIChat } from "@/components/storefront/ai-chat";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartProvider } from "@/hooks/use-cart";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');
  const store = stores.find(s => s.id === storeId);
  
  if (!store) {
    // This will render the not-found.tsx file if it exists, or a default Next.js 404 page.
    notFound();
  }
  
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header storeName={store.name} />
        <main className="flex-1">
          {children}
        </main>
        <Footer storeName={store.name} />
        <AIChat />
      </div>
    </CartProvider>
  );
}
