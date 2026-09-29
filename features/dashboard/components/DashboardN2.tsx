// ============================================================
// features/dashboard/components/DashboardN2.tsx — Espace Supervision N+2
// Revue hiérarchique, contre-évaluation, vision d'équipe & formations
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { Card, CardHeader, AvatarWithName } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckCircleIcon, PencilIcon, EyeIcon, ScaleIcon, UsersIcon, ArrowPathIcon } from "@/components/ui/Icons";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import type { EvaluationCycle } from "@/types";

export function DashboardN2() {
  const [fiches, setFiches] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFicheModal, setSelectedFicheModal] = useState<EvaluationCycle | null>(null);
  const [activeTab, setActiveTab] = useState<"A_TRAITER" | "TOUS" | "FORMATIONS" | "ARBITRAGES">("A_TRAITER");

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Tenter d'abord l'endpoint dédié N2, sinon fallback sur toutes les fiches
      let data = await evaluationsApi.getN2TeamEvaluations();
      if (!data || data.length === 0) {
        data = await evaluationsApi.getAllForRh();
      }
      setFiches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[DashboardN2] Erreur chargement fiches N2:", err);
      setFiches([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dossiers nécessitant une action ou revue N+2 (y compris quand le N1 a noté et que c'est en visa ou validation N2)
  const evaluationsAValider = fiches.filter(
    (f) => ["EN_ATTENTE_N2", "VALIDATION_N2", "VISA_SALARIE"].includes(f.statut)
  );

  const arbitrages = fiches.filter((f) => f.statut === "ARBITRAGE");
  const evaluationsCloturees = fiches.filter((f) => ["VALIDE", "CLOTURE"].includes(f.statut));

  // Extraction consolidée de tous les besoins en formation de l'équipe
  const allFormations = fiches.flatMap((f) => {
    const list = f.formations || [];
    return list.map((form) => ({
      ...form,
      salarieNom: f.salarie ? `${f.salarie.prenom || ""} ${f.salarie.nom}`.trim() : "Collaborateur",
      salariePoste: f.salarie?.poste || "Poste non défini",
      ficheId: f.id,
    }));
  });

  const stats = [
    {
      label: "Dossiers à contre-évaluer",
      value: String(evaluationsAValider.length),
      subValue: evaluationsAValider.length > 0 ? "Action ou revue N+2 requise" : "À jour",
      icon: <PencilIcon size={18} className="text-purple-600" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Collaborateurs supervisés",
      value: String(fiches.length),
      subValue: "Périmètre hiérarchique N+2",
      icon: <UsersIcon size={18} className="text-agilly-primary" />,
      color: "text-agilly-primary",
      bg: "bg-[#FFF0E0]",
    },
    {
      label: "Besoins en formations",
      value: String(allFormations.length),
      subValue: "Proposés par les managers N+1",
      icon: <CheckCircleIcon size={18} className="text-blue-600" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Arbitrages hiérarchiques",
      value: String(arbitrages.length),
      subValue: arbitrages.length > 0 ? "Écart ou contestation" : "Aucun litige",
      icon: <ScaleIcon size={18} className="text-red-600" />,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-[1200px] mx-auto w-full font-sans">
      {selectedFicheModal && (
        <FicheEvaluationModal
          isOpen={true}
          onClose={() => {
            setSelectedFicheModal(null);
            loadData();
          }}
          evaluationId={selectedFicheModal.id}
          dossier={{
            id: selectedFicheModal.id,
            ficheId: selectedFicheModal.id,
            salarieId: selectedFicheModal.salarie?.id,
            nom: selectedFicheModal.salarie?.nom || "",
            prenom: selectedFicheModal.salarie?.prenom || "",
            poste: selectedFicheModal.salarie?.poste || "",
            direction: (selectedFicheModal.salarie as any)?.departement || "Direction Technique",
            formations: selectedFicheModal.formations || [],
          }}
          objectifs={selectedFicheModal.objectifs}
          role="N2"
          readOnly={false}
          onSaved={loadData}
        />
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-wrap justify-between items-end gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 m-0 tracking-tight">
            Tableau de Bord Supervision (N+2)
          </h1>
          <p className="text-xs text-slate-500 m-0 mt-1 font-medium">
            Supervision de la chaîne managériale, contre-évaluation hiérarchique et suivi des formations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
            title="Rafraîchir"
          >
            <ArrowPathIcon size={14} className={isLoading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── KPIS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── NAVIGATION DES VUES N+2 ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 flex-wrap">
        <button
          onClick={() => setActiveTab("A_TRAITER")}
          className={`px-3 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "A_TRAITER"
              ? "border-agilly-primary text-agilly-primary bg-orange-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          ⚡ Dossiers Prioritaires N+2 ({evaluationsAValider.length})
        </button>
        <button
          onClick={() => setActiveTab("TOUS")}
          className={`px-3 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "TOUS"
              ? "border-agilly-primary text-agilly-primary bg-orange-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          👥 Tous les Collaborateurs Supervisés ({fiches.length})
        </button>
        <button
          onClick={() => setActiveTab("FORMATIONS")}
          className={`px-3 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "FORMATIONS"
              ? "border-agilly-primary text-agilly-primary bg-orange-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          🎓 Formations Demandées ({allFormations.length})
        </button>
        <button
          onClick={() => setActiveTab("ARBITRAGES")}
          className={`px-3 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "ARBITRAGES"
              ? "border-agilly-primary text-agilly-primary bg-orange-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          ⚖️ Arbitrages ({arbitrages.length})
        </button>
      </div>

      {/* ── CONTENU SELON ONGLET ── */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 p-12 text-center text-xs text-slate-500 font-medium">
          <div className="w-6 h-6 border-2 border-agilly-primary border-t-transparent animate-spin mx-auto mb-2" />
          Chargement des données de supervision N+2...
        </div>
      ) : activeTab === "A_TRAITER" ? (
        /* VUE 1 : DOSSIERS PRIORITAIRES */
        <Card padding="none" className="overflow-hidden border border-slate-200 shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 m-0">
                Évaluations en attente de visa ou contre-évaluation N+2
              </h2>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Dossiers notés par le Manager N+1 nécessitant votre validation ou contre-expertise
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-800">
              {evaluationsAValider.length} dossier(s)
            </span>
          </div>

          <div className="divide-y divide-slate-100 bg-white">
            {evaluationsAValider.length > 0 ? (
              evaluationsAValider.map((ev) => {
                const nom = ev.salarie?.nom || "Collaborateur";
                const prenom = ev.salarie?.prenom || "";
                const poste = ev.salarie?.poste || "Collaborateur";
                const noteN1 = ev.noteGlobale !== undefined ? Number(ev.noteGlobale).toFixed(2) : null;
                const formationsCount = ev.formations?.length || 0;

                return (
                  <div key={ev.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors flex-wrap">
                    <div className="flex items-center gap-3 min-w-[240px]">
                      <AvatarWithName nom={nom} prenom={prenom} poste={poste} role="SALARIE" size="sm" />
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      {noteN1 && (
                        <div className="text-center px-3 py-1 bg-orange-50 border border-orange-200">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Note N+1</span>
                          <span className="text-xs font-black text-agilly-primary">{noteN1} / 20</span>
                        </div>
                      )}

                      {formationsCount > 0 && (
                        <div className="text-center px-3 py-1 bg-blue-50 border border-blue-200">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Formations</span>
                          <span className="text-xs font-bold text-blue-700">{formationsCount} proposée(s)</span>
                        </div>
                      )}

                      <EvaluationStatusBadge statut={ev.statut} size="sm" />

                      <button
                        onClick={() => setSelectedFicheModal(ev)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <PencilIcon size={13} />
                        Contre-évaluer & Valider Visa
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center">
                <CheckCircleIcon size={28} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800 m-0">Toutes les contre-évaluations N+2 sont à jour</p>
                <p className="text-[11px] text-slate-500 mt-1 mb-0">Consultez l'onglet "Tous les Collaborateurs" pour revoir l'ensemble des fiches.</p>
              </div>
            )}
          </div>
        </Card>
      ) : activeTab === "TOUS" ? (
        /* VUE 2 : TABLEAU COMPLET DES COLLABORATEURS DU PÉRIMÈTRE */
        <Card padding="none" className="overflow-hidden border border-slate-200 shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-sm font-bold text-slate-900 m-0">
              Annuaire complet des dossiers supervisés (N-1 et N-2)
            </h2>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Vue consolidée de l'ensemble des collaborateurs sous votre direction
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3">Collaborateur</th>
                  <th className="p-3">Poste</th>
                  <th className="p-3 text-center">Auto-Note</th>
                  <th className="p-3 text-center">Note N+1</th>
                  <th className="p-3 text-center">Formations</th>
                  <th className="p-3">Statut Dossier</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fiches.map((ev) => {
                  const nom = ev.salarie?.nom || "Collaborateur";
                  const prenom = ev.salarie?.prenom || "";
                  const poste = ev.salarie?.poste || "Collaborateur";
                  const autoNote = ev.noteAutoEvaluation !== undefined ? Number(ev.noteAutoEvaluation).toFixed(2) : "—";
                  const noteN1 = ev.noteGlobale !== undefined ? Number(ev.noteGlobale).toFixed(2) : "—";
                  const formCount = ev.formations?.length || 0;

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <span className="text-xs font-bold text-slate-900 block">{prenom} {nom}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{ev.salarie?.email}</span>
                      </td>
                      <td className="p-3 text-xs text-slate-600">{poste}</td>
                      <td className="p-3 text-xs font-semibold text-slate-700 text-center">{autoNote}</td>
                      <td className="p-3 text-xs font-black text-agilly-primary text-center">{noteN1}</td>
                      <td className="p-3 text-center">
                        {formCount > 0 ? (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5">
                            {formCount}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <EvaluationStatusBadge statut={ev.statut} size="sm" />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedFicheModal(ev)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <EyeIcon size={12} />
                          Examiner
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : activeTab === "FORMATIONS" ? (
        /* VUE 3 : FORMATIONS PROPOSÉES DE L'ÉQUIPE */
        <Card padding="none" className="overflow-hidden border border-slate-200 shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-sm font-bold text-slate-900 m-0">
              Synthèse des besoins en formation recommandés par les managers N+1
            </h2>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Consolidation des formations à budgéter et valider pour votre département
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3">Collaborateur</th>
                  <th className="p-3">Formation Recommandée</th>
                  <th className="p-3">Délai Prévisionnel</th>
                  <th className="p-3">Priorité</th>
                  <th className="p-3">Objectif Visé</th>
                  <th className="p-3 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allFormations.length > 0 ? (
                  allFormations.map((form) => {
                    const ficheAssociee = fiches.find((f) => f.id === form.ficheId);
                    const prioColor =
                      form.priorite === "HAUTE"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : form.priorite === "BASSE"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200";

                    return (
                      <tr key={form.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <span className="text-xs font-bold text-slate-900 block">{form.salarieNom}</span>
                          <span className="text-[10px] text-slate-500">{form.salariePoste}</span>
                        </td>
                        <td className="p-3 text-xs font-bold text-slate-800">{form.intitule}</td>
                        <td className="p-3 text-xs text-slate-600">{form.delai || "Non précisé"}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 border ${prioColor}`}>
                            {form.priorite || "MOYENNE"}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-slate-500 max-w-[260px] truncate">{form.objectifVise || "—"}</td>
                        <td className="p-3 text-right">
                          {ficheAssociee && (
                            <button
                              onClick={() => setSelectedFicheModal(ficheAssociee)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <EyeIcon size={12} />
                              Voir la fiche
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-slate-400">
                      Aucune préconisation de formation n'a été saisie pour le moment par les managers N+1.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* VUE 4 : ARBITRAGES */
        <Card padding="none" className="overflow-hidden border border-slate-200 shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-sm font-bold text-slate-900 m-0">
              Arbitrages et contestations nécessitant décision N+2 / RH
            </h2>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Dossiers avec réserves du salarié ou divergence d'appréciation
            </p>
          </div>

          <div className="divide-y divide-slate-100 bg-white">
            {arbitrages.length > 0 ? (
              arbitrages.map((arb) => {
                const nom = arb.salarie?.nom || "Collaborateur";
                const prenom = arb.salarie?.prenom || "";
                const poste = arb.salarie?.poste || "Collaborateur";

                return (
                  <div key={arb.id} className="p-4 flex items-center justify-between gap-4 hover:bg-red-50/40 transition-colors">
                    <div>
                      <AvatarWithName nom={nom} prenom={prenom} poste={poste} role="SALARIE" size="sm" />
                      <p className="text-xs mt-2 p-2 bg-red-50 text-red-800 border border-red-200 font-medium">
                        {arb.observation || "Désaccord exprimé lors du visa ou écart significatif de notation."}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFicheModal(arb)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <EyeIcon size={13} />
                      Examiner le litige
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center">
                <CheckCircleIcon size={28} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800 m-0">Aucun arbitrage en cours</p>
                <p className="text-[11px] text-slate-500 mt-1 mb-0">Tous les avis N+1 et visas salariés sont conformes et sans contentieux.</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
