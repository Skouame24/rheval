// ============================================================
// app/dashboard/mon-equipe/page.tsx
// Page "Mon Équipe" — Multi-rôles : Affiche DashboardN2 pour N+2 ou CollaborateursN1 pour N+1
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, Button, PageHeaderSkeleton, CollaborateursListSkeleton } from "@/components/ui";
import { ModalDefinirObjectifs } from "@/features/evaluation/components/ModalDefinirObjectifs";
import { DashboardN2 } from "@/features/dashboard/components/DashboardN2";
import { UsersIcon, TargetIcon, AlertTriangleIcon } from "@/components/ui/Icons";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useMyTeam } from "@/lib/hooks/useTeam";
import { cyclesApi } from "@/lib/api/cycles.api";
import type { User, Cycle } from "@/types";

export default function MonEquipePage() {
  const { user } = useAuth();
  const [selectedCollab, setSelectedCollab] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCycle, setActiveCycle] = useState<Cycle | null | undefined>(undefined);
  const { isLoading, error, search } = useMyTeam();

  useEffect(() => {
    cyclesApi.getActif()
      .then((c) => setActiveCycle(c))
      .catch(() => setActiveCycle(null));
  }, []);

  const filteredTeam = search(searchQuery);

  const displayName = user
    ? `${user.prenom ? user.prenom + " " : ""}${user.nom}`.trim()
    : "Manager";

  // Si l'utilisateur connecté est N+2, on affiche la vue complète de supervision N+2
  if (user?.role === "N2") {
    return (
      <AppShell role="N2" userName={displayName} userEmail={user?.email || "drh@agilly.com"}>
        <DashboardN2 />
      </AppShell>
    );
  }

  return (
    <AppShell
      role={user?.role || "N1"}
      userName={displayName}
      userEmail={user?.email || "manager@agilly.com"}
    >
      <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full">
        {selectedCollab && (
          <ModalDefinirObjectifs
            isOpen={true}
            onClose={() => setSelectedCollab(null)}
            salariedId={selectedCollab.id}
            salariedName={`${selectedCollab.prenom} ${selectedCollab.nom}`}
            salariedPoste={selectedCollab.poste}
          />
        )}

        {isLoading ? (
          <>
            <PageHeaderSkeleton />
            <CollaborateursListSkeleton count={4} />
          </>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 text-red-700 text-sm font-semibold flex items-center gap-3">
                <AlertTriangleIcon size={18} className="text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <PageHeader
              title="Mes Collaborateurs"
              subtitle="Gérez les objectifs et suivez la performance de votre périmètre d'équipe"
              breadcrumbs={[{ label: "Espace Manager" }, { label: "Collaborateurs" }]}
            />

            {/* Alerte si aucune campagne RH n'est active */}
            {activeCycle === null && (
              <div className="bg-amber-50 border border-amber-300 p-4 text-amber-900 text-sm font-semibold flex items-center gap-3">
                <AlertTriangleIcon size={20} className="text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-amber-900 m-0">Campagne d'évaluation non ouverte</p>
                  <p className="m-0 mt-0.5 text-xs text-amber-800 font-normal">
                    Aucune campagne d'évaluation n'est actuellement ouverte par les RH. La fixation et la validation des objectifs de vos collaborateurs débuteront dès le lancement officiel de la campagne.
                  </p>
                </div>
              </div>
            )}

            <Card padding="lg" className="bg-white border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
                <CardHeader
                  title="Liste des Collaborateurs"
                  subtitle={`${filteredTeam.length} salarié(s) rattaché(s) à votre périmètre`}
                  icon={<UsersIcon size={20} className="text-[#F0822A]" />}
                />
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Rechercher (Nom, prénom, poste)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-none focus:border-[#F0822A] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {filteredTeam.length === 0 ? (
                <EmptyState
                  icon={<UsersIcon size={32} className="text-slate-400" />}
                  title="Aucun collaborateur trouvé"
                  description={
                    searchQuery
                      ? "Aucun membre de l'équipe ne correspond aux critères de recherche."
                      : "Aucun collaborateur direct n'est actuellement rattaché sous votre responsabilité hiérarchique."
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTeam.map((member: User) => (
                    <div
                      key={member.id}
                      className="bg-white border border-slate-200 p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-[#F0822A] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                          {member.prenom?.charAt(0) || member.nom?.charAt(0) || "U"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate m-0">
                            {member.prenom} {member.nom}
                          </h4>
                          <p className="text-xs font-semibold text-[#F0822A] truncate mt-0.5 m-0">
                            {member.poste || "Collaborateur"}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 space-y-1">
                        <p className="truncate m-0">{member.email}</p>
                        {member.departement && (
                          <p className="text-slate-400 truncate m-0">
                            Département : {member.departement}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-100 text-slate-600 uppercase tracking-wider">
                          {member.role}
                        </span>
                        <Button
                          variant={!activeCycle ? "secondary" : "primary"}
                          size="sm"
                          leftIcon={<TargetIcon size={14} />}
                          onClick={() => setSelectedCollab(member)}
                          disabled={!activeCycle}
                        >
                          {!activeCycle ? "Consulter les Objectifs" : "Fixer les Objectifs"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}

