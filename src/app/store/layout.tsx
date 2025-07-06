
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getStoreByDomain } from "@/lib/firebase-service";
import { AIChat } from "@/components/storefront/ai-chat";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartProvider } from "@/hooks/use-cart";
import { StoreProvider } from "@/hooks/use-store";
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  children: React.ReactNode;
};

export async function generateMetadata(
  {}: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const headersList = headers();
  const domain = headersList.get('host')!;
  const store = await getStoreByDomain(domain);

  if (!store) {
    return {
      title: 'Nexus Cart Storefront',
      description: 'The easiest way to start your e-commerce journey.',
    }
  }

  return {
    title: store.metaTitle || store.name,
    description: store.metaDescription || `Welcome to ${store.name}`,
    keywords: store.metaKeywords || '',
    openGraph: {
        title: store.metaTitle || store.name,
        description: store.metaDescription || `Welcome to ${store.name}`,
    },
  }
}

export default async function StoreLayout({ children }: Props) {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');
  
  if (!storeId) {
    const domain = headersList.get('host')!;
    const storeByDomain = await getStoreByDomain(domain);
    if (!storeByDomain) {
      notFound();
    }
    // This case is for direct access via domain, but we won't have admin context.
    // The StoreProvider handles this scenario.
  }
  
  return (
    <StoreProvider storeId={storeId}>
        <CartProvider>
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1">
            {children}
            </main>
            <Footer />
            <AIChat />
        </div>
        </CartProvider>
    </StoreProvider>
  );
}
