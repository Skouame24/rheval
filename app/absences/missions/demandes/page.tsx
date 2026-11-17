import { Suspense } from "react";
import { MesDemandesContent } from "@/features/absences/components/MesDemandes";

export default function MesMissionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Chargement de vos missions...</div>}>
      <MesDemandesContent />
    </Suspense>
  );
}
