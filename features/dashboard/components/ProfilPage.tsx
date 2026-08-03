// ============================================================
// features/dashboard/components/ProfilPage.tsx
// ============================================================
"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input } from "@/components/ui";

export function ProfilPage({ role }: { role: string }) {
  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[900px] mx-auto">
      <PageHeader
        title="Mon Profil"
        subtitle="Gérez vos informations personnelles et professionnelles."
        breadcrumbs={[{ label: "Mon espace", href: `/dashboard/${role}` }, { label: "Profil" }]}
      />

      <div className="bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row p-8 gap-10">
        
        {/* Photo & Basic Info */}
        <div className="flex flex-col items-center gap-4 shrink-0 md:w-64 border-r border-gray-100 pr-8">
          <div className="w-32 h-32 bg-agilly-black text-white rounded-full flex items-center justify-center text-4xl font-black relative overflow-hidden">
            A
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-xs uppercase font-bold text-white tracking-widest">Modifier</span>
            </div>
          </div>
          
          <div className="text-center mt-2">
            <h2 className="text-xl font-bold text-agilly-black m-0 mb-1">Amara Diallo</h2>
            <p className="text-sm font-medium text-gray-500 m-0 uppercase tracking-widest">Consultant IT</p>
          </div>
          
          <div className="w-full mt-4 flex flex-col gap-2">
            <div className="flex justify-between items-center bg-gray-50 px-3 py-2 border border-gray-200">
              <span className="text-xs font-semibold text-gray-500">Matricule</span>
              <span className="text-sm font-bold text-agilly-black">AGY-4091</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 px-3 py-2 border border-gray-200">
              <span className="text-xs font-semibold text-gray-500">Entrée le</span>
              <span className="text-sm font-bold text-agilly-black">12/03/2021</span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex-1 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-agilly-black m-0 border-b border-gray-200 pb-2">Informations de contact</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Prénom" defaultValue="Amara" />
            <Input label="Nom" defaultValue="Diallo" />
            <div className="md:col-span-2">
              <Input label="Adresse e-mail professionnelle" defaultValue="amara.diallo@agilly.com" type="email" disabled />
              <span className="text-xs text-gray-400 mt-1 block">L'adresse e-mail professionnelle ne peut être modifiée que par les RH.</span>
            </div>
            <Input label="Téléphone mobile" defaultValue="+33 6 12 34 56 78" type="tel" />
            <Input label="Poste" defaultValue="Consultant IT" disabled />
          </div>

          <h3 className="text-lg font-bold text-agilly-black m-0 border-b border-gray-200 pb-2 mt-4">Management</h3>
          <div className="bg-[#F4F7FB] border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-600 m-0 mb-1">Votre Manager N+1 :</p>
            <p className="text-base font-bold text-agilly-black m-0">Sevan AKOUMIA</p>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="primary">Enregistrer les modifications</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
