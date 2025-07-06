
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getStore, getPlans } from "@/lib/firebase-service";
import { ClientSettingsPage } from "./_components/client-settings-page";

export default async function SettingsPage() {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');

  if (!storeId) {
    notFound();
  }

  const store = await getStore(storeId);
  if (!store) {
    notFound();
  }
  
  const allPlans = await getPlans();
  const currentPlan = allPlans.find(p => p.id === store.planId);

  return (
    <ClientSettingsPage store={store} currentPlan={currentPlan} allPlans={allPlans} />
  );
}
