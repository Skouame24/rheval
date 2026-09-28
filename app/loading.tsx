import { BrandSpinner } from "@/components/ui/Skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-4">
      <div className="bg-white border border-gray-200 p-8 shadow-sm flex flex-col items-center gap-6 max-w-sm w-full text-center">
        {/* Logo Monogram Agilly */}
        <div className="w-12 h-12 bg-[#0F172A] flex items-center justify-center font-black text-white text-xl tracking-wider border-b-2 border-b-[#F0822A]">
          AG
        </div>
        <BrandSpinner size="lg" label="Initialisation de l'application..." />
        <div className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">
          Plateforme Évaluation RH — Agilly
        </div>
      </div>
    </div>
  );
}
