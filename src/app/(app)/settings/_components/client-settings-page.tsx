
"use client";

import { useTranslation } from "@/hooks/use-translation";
import { SettingsForm } from "@/components/admin/settings-form";
import type { Store, Plan } from "@/lib/types";

interface ClientSettingsPageProps {
  store: Store;
  currentPlan?: Plan;
  allPlans: Plan[];
}

export function ClientSettingsPage({ store, currentPlan, allPlans }: ClientSettingsPageProps) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-2">
      <h1 className="text-3xl font-semibold">{t('nav.settings')}</h1>
      <SettingsForm store={store} currentPlan={currentPlan} allPlans={allPlans} />
    </div>
  );
}
