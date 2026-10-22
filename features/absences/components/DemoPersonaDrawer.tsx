// ============================================================
// features/absences/components/DemoPersonaDrawer.tsx
// Tiroir latéral escamotable pour tester les rôles du circuit
// Conforme à la proposition : ne pollue pas la navigation principale
// ============================================================

"use client";

import React from "react";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { PersonaUser } from "@/types/absences.types";

export function DemoPersonaDrawer() {
  const { currentPersona, setCurrentPersona, allPersonas, isDemoDrawerOpen, setIsDemoDrawerOpen } =
    useAbsences();

  if (!isDemoDrawerOpen) return null;

  const handleSelect = (persona: PersonaUser) => {
    setCurrentPersona(persona);
    setIsDemoDrawerOpen(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SALARIE":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "SUPERIEUR_N1":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DRH":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "DIRECTION_DG":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "AGENT_DRH":
        return "bg-[#FFF4EB] text-[#F0822A] border-[#FDE3CC]";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getRoleCircuitDescription = (role: string) => {
    switch (role) {
      case "SALARIE":
        return "Étape 1 : Renseigne et dépose ses demandes, consulte son solde et ses permissions éditées.";
      case "SUPERIEUR_N1":
        return "Étape 2 : Première validation d'équipe. Vérifie l'impact sur le service et émet son avis.";
      case "DRH":
        return "Étape 3 : Contrôle de conformité, vérification du solde restant et application des règles de gestion.";
      case "DIRECTION_DG":
        return "Étape 4 : Validation finale de la Direction Générale (accès optimisé pour la mobilité).";
      case "AGENT_DRH":
        return "Étape 5 & 6 : Génération du bulletin officiel PDF numéroté et classement dans la GED.";
      default:
        return "Administration transversale.";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Fond obscurci */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDemoDrawerOpen(false)}
      />

      {/* Contenu du tiroir latéral */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Entête du tiroir */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#F0822A]" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Mode Démo — Changement de rôle
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sélectionnez un acteur pour tester son parcours dans le circuit hiérarchique.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDemoDrawerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 border border-transparent transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Liste des Personas */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {allPersonas.map((persona) => {
            const isSelected = currentPersona.id === persona.id;
            return (
              <div
                key={persona.id}
                onClick={() => handleSelect(persona)}
                className={`
                  p-4 border transition-all cursor-pointer text-left
                  ${
                    isSelected
                      ? "border-[#F0822A] bg-[#FFF4EB]/50 shadow-xs ring-1 ring-[#F0822A]"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {persona.prenom.charAt(0)}
                      {persona.nom.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {persona.prenom} {persona.nom}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-[#F0822A] bg-white px-1.5 py-0.5 border border-[#FDE3CC]">
                            Actif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {persona.poste}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Matricule : {persona.matricule} • {persona.departement}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 border ${getRoleBadgeColor(
                      persona.role
                    )}`}
                  >
                    {persona.labelRole.split(" ")[0]}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100/80">
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {getRoleCircuitDescription(persona.role)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pied de tiroir explicatif */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-700 mb-1">Règles du circuit nominal :</p>
          <p>
            1. Salarié dépose &rarr; 2. N+1 émet avis &rarr; 3. DRH valide &rarr; 4. DG valide &rarr; 5. Agent DRH édite & archive.
          </p>
        </div>
      </div>
    </div>
  );
}

