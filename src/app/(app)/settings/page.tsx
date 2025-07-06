import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { stores, plans } from "@/lib/placeholder-data";
import { SettingsForm } from "@/components/admin/settings-form";
import { ClientSettingsPage } from "./_components/client-settings-page";

export default function SettingsPage() {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');

  const store = stores.find(s => s.id === storeId);
  if (!store) {
    notFound();
  }

  const currentPlan = plans.find(p => p.id === store.planId);

  return (
    <ClientSettingsPage store={store} currentPlan={currentPlan} allPlans={plans} />
  );
}
