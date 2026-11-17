import { Suspense } from "react";
import { NouvelleDemandeForm } from "@/features/absences/components/NouvelleDemandeForm";

export default function NouvelleMissionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Chargement du formulaire...</div>}>
      <NouvelleDemandeForm />
    </Suspense>
  );
}
