// ============================================================
// features/dashboard/components/ParametresPage.tsx
// ============================================================
"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input } from "@/components/ui";

export function ParametresPage({ role }: { role: string }) {
  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[900px] mx-auto">
      <PageHeader
        title="Paramètres"
        subtitle="Préférences de votre compte et sécurité."
        breadcrumbs={[{ label: "Mon espace", href: `/dashboard/${role}` }, { label: "Paramètres" }]}
      />

      <div className="flex flex-col gap-6">
        {/* Sécurité */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-bold text-agilly-black m-0 mb-6 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Sécurité du mot de passe
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <Input label="Mot de passe actuel" type="password" placeholder="••••••••" />
            </div>
            <Input label="Nouveau mot de passe" type="password" placeholder="••••••••" />
            <Input label="Confirmer le nouveau mot de passe" type="password" placeholder="••••••••" />
          </div>
          
          <Button variant="secondary">Mettre à jour le mot de passe</Button>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-bold text-agilly-black m-0 mb-6 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Préférences de notifications
          </h3>
          
          <div className="flex flex-col gap-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="mt-0.5">
                <input type="checkbox" className="w-4 h-4 text-agilly-primary border-gray-300 rounded-none focus:ring-agilly-primary" defaultChecked />
              </div>
              <div>
                <p className="text-sm font-bold text-agilly-black m-0">Alertes par e-mail</p>
                <p className="text-xs text-gray-500 m-0">Recevez un e-mail à chaque nouvelle étape de votre évaluation.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <div className="mt-0.5">
                <input type="checkbox" className="w-4 h-4 text-agilly-primary border-gray-300 rounded-none focus:ring-agilly-primary" defaultChecked />
              </div>
              <div>
                <p className="text-sm font-bold text-agilly-black m-0">Rappels quotidiens</p>
                <p className="text-xs text-gray-500 m-0">Recevez un récapitulatif des tâches en attente.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Accessibilité */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-bold text-agilly-black m-0 mb-6 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Apparence & Accessibilité
          </h3>
          
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-bold text-agilly-black mb-2">Thème de l'interface</p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer border border-gray-200 p-3 bg-gray-50 w-32 hover:border-agilly-primary">
                  <input type="radio" name="theme" defaultChecked className="text-agilly-primary focus:ring-agilly-primary" />
                  <span className="text-sm font-medium">Clair</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer border border-gray-200 p-3 opacity-50 w-32">
                  <input type="radio" name="theme" disabled />
                  <span className="text-sm font-medium">Sombre (Bientôt)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
