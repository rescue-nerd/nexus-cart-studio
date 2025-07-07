import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getStore, getStoreAnalytics } from "@/lib/firebase-service";
import { ClientDashboard } from "./_components/client-dashboard";

export default async function DashboardPage() {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');

  if (!storeId) {
    notFound();
  }
  
  const store = await getStore(storeId);
  if (!store) {
    notFound();
  }

  const analytics = await getStoreAnalytics(storeId);
  
  return (
    <ClientDashboard
      store={store}
      analytics={analytics}
    />
  );
}
