import { Suspense } from "react";
import { RegistreGedContent } from "@/features/absences/components/RegistreGed";

export default function RegistreGedPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Chargement du registre...</div>}>
      <RegistreGedContent />
    </Suspense>
  );
}
