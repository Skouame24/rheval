// ============================================================
// features/dashboard/components/ModalProfilEmploye.tsx
// Modal de Détails du Profil Salarié (RH / Management)
// ============================================================

"use client";

interface ModalProfilEmployeProps {
  isOpen: boolean;
  onClose: () => void;
  employe?: {
    id: string;
    nom: string;
    prenom: string;
    poste: string;
    direction: string;
    site: string;
    n1: string;
    email: string;
    matricule?: string;
    telephone?: string;
    dateEmbauche?: string;
    statutCycle?: string;
    noteActuelle?: string;
  } | null;
  onOpenFiche?: (id: string) => void;
}

export function ModalProfilEmploye({ isOpen, onClose, employe, onOpenFiche }: ModalProfilEmployeProps) {
  if (!isOpen || !employe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-none border border-slate-200 shadow-2xl flex flex-col overflow-hidden font-sans">
        
        {/* Ligne d'accent Orange Agilly */}
        <div className="h-1.5 w-full bg-[#F0822A] shrink-0" />

        {/* Header Modal Exécutif */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-[#F0822A] text-white font-extrabold text-xl flex items-center justify-center border border-orange-400 shrink-0">
              {employe.prenom.charAt(0)}
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-[#F0822A] uppercase tracking-widest block">
                DOSSIER INDIVIDUEL COLLABORATEUR
              </span>
              <h2 className="text-xl font-extrabold text-white m-0 tracking-tight">
                {employe.prenom} {employe.nom}
              </h2>
              <p className="text-xs font-semibold text-slate-300 m-0 mt-0.5">
                {employe.poste} · Direction {employe.direction}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-none border border-slate-700 bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="p-6 flex flex-col gap-6 bg-[#F7F8FA] overflow-y-auto max-h-[75vh]">
          
          {/* CARTE 1 : INFORMATIONS ADMINISTRATIVES */}
          <div className="bg-white p-5 border border-slate-200 rounded-none shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest m-0">
              📌 Informations Personnelles & Contractuelles
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-400 font-bold block mb-1">Matricule RH</span>
                <strong className="text-slate-900 font-extrabold text-sm">{employe.matricule || "EMP-2026-084"}</strong>
              </div>

              <div className="bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-400 font-bold block mb-1">Site Affectation</span>
                <strong className="text-slate-900 font-extrabold text-sm">{employe.site}</strong>
              </div>

              <div className="bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-400 font-bold block mb-1">Email Professionnel</span>
                <strong className="text-slate-900 font-semibold text-xs">{employe.email}</strong>
              </div>

              <div className="bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-400 font-bold block mb-1">Téléphone</span>
                <strong className="text-slate-900 font-semibold text-xs">{employe.telephone || "+225 07 88 99 00 11"}</strong>
              </div>
            </div>
          </div>

          {/* CARTE 2 : RATTACHEMENT HIÉRARCHIQUE */}
          <div className="bg-white p-5 border border-slate-200 rounded-none shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest m-0">
              👥 Rattachement Hiérarchique & Validation
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="border-l-4 border-l-[#F0822A] bg-[#FFF7ED] p-4 border border-slate-200">
                <span className="text-[10px] font-extrabold text-[#F0822A] uppercase tracking-wider block mb-1">Manager N+1</span>
                <p className="text-sm font-extrabold text-slate-900 m-0">{employe.n1}</p>
                <span className="text-[11px] text-slate-500 font-semibold mt-1 block">Superviseur Évaluation Directe</span>
              </div>

              <div className="border-l-4 border-l-blue-600 bg-blue-50/60 p-4 border border-slate-200">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block mb-1">Direction N+2</span>
                <p className="text-sm font-extrabold text-slate-900 m-0">Direction Technique (Alexis BAMBA)</p>
                <span className="text-[11px] text-slate-500 font-semibold mt-1 block">Validateur Secondaire</span>
              </div>
            </div>
          </div>

          {/* CARTE 3 : STATUT DE L'ÉVALUATION 2026 */}
          <div className="bg-white p-5 border border-slate-200 rounded-none shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest m-0">
              📊 Synthèse de la Campagne d'Évaluation 2026
            </h3>

            <div className="flex items-center justify-between bg-slate-50 p-4 border border-slate-200 flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Statut Officiel</span>
                <span className="text-xs font-extrabold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                  🟢 {employe.statutCycle || "Dossier Validé & Signé RH"}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Note de Performance</span>
                <p className="text-2xl font-extrabold text-[#F0822A] m-0">
                  {employe.noteActuelle || "18.5"} <span className="text-xs text-slate-400">/ 20 (83%)</span>
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer avec CTA direct vers Fiche Officielle */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-300 bg-white text-slate-700 font-bold text-xs rounded-none hover:bg-slate-100 transition-all cursor-pointer"
          >
            Fermer
          </button>

          {onOpenFiche && (
            <button
              onClick={() => {
                onClose();
                onOpenFiche(employe.id);
              }}
              className="px-6 py-2.5 bg-[#F0822A] text-white font-extrabold text-xs rounded-none hover:bg-[#d97220] transition-all cursor-pointer flex items-center gap-2"
            >
              📋 Ouvrir la Fiche Officielle Excel du Salarié →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
