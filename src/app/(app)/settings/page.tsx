import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { stores, plans } from "@/lib/placeholder-data";
import { SettingsForm } from "@/components/admin/settings-form";

export default function SettingsPage() {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');

  const store = stores.find(s => s.id === storeId);
  if (!store) {
    notFound();
  }

  const currentPlan = plans.find(p => p.id === store.planId);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-2">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <SettingsForm store={store} currentPlan={currentPlan} allPlans={plans} />
    </div>
  );
}
