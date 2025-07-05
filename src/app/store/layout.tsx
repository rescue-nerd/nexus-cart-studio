import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { stores } from "@/lib/placeholder-data";
import { AIChat } from "@/components/storefront/ai-chat";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartProvider } from "@/hooks/use-cart";
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  children: React.ReactNode;
};

export async function generateMetadata(
  {}: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');
  const store = stores.find(s => s.id === storeId);

  // Fallback metadata if store not found
  if (!store) {
    return {
      title: 'Nexus Cart Storefront',
      description: 'The easiest way to start your e-commerce journey.',
    }
  }

  // Optionally, you can resolve previous metadata
  // const previousImages = (await parent).openGraph?.images || []

  return {
    title: store.metaTitle || store.name,
    description: store.metaDescription || `Welcome to ${store.name}`,
    keywords: store.metaKeywords || '',
    openGraph: {
        title: store.metaTitle || store.name,
        description: store.metaDescription || `Welcome to ${store.name}`,
      // images: ['/some-specific-page-image.jpg', ...previousImages],
    },
  }
}

export default function StoreLayout({ children }: Props) {
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
