// ============================================================
// app/absences/workflows/page.tsx
// Configuration dynamique des circuits de validation RH (DRH)
// Permet à la DRH de paramétrer le workflow par type de demande
// (Avis N+1, Visa DRH, Accord Direction Générale DG, seuil en jours, justificatifs)
// Respect strict du Design System Agilly Corporate & IBM Carbon
// ============================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { TypeDemandeConfig } from "@/types/absences.types";
import { demandesApi } from "@/lib/api";

const CATEGORIE_CONFIG: Record<string, { label: string; colorBg: string; colorText: string; borderColor: string }> = {
  CONGE: { label: "Congé Légal", colorBg: "bg-blue-50", colorText: "text-blue-700", borderColor: "border-blue-200" },
  PERMISSION: { label: "Permission", colorBg: "bg-purple-50", colorText: "text-purple-700", borderColor: "border-purple-200" },
  MALADIE: { label: "Santé & Repos", colorBg: "bg-rose-50", colorText: "text-rose-700", borderColor: "border-rose-200" },
  MISSION: { label: "Mission & Déplacement", colorBg: "bg-amber-50", colorText: "text-amber-700", borderColor: "border-amber-200" },
  INTERVENTION: { label: "Intervention", colorBg: "bg-emerald-50", colorText: "text-emerald-700", borderColor: "border-emerald-200" },
};

export default function WorkflowsConfigPage() {
  const { currentPersona } = useAbsences();
  const [types, setTypes] = useState<TypeDemandeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("TOUS");

  // Charger les types depuis le backend
  const loadTypes = async () => {
    try {
      setLoading(true);
      const data = await demandesApi.getTypesDemande();
      setTypes(data);
    } catch (err) {
      console.error("Erreur chargement types de demandes:", err);
      showToast("Impossible de charger les types de demandes.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Mise à jour locale d'un champ
  const handleFieldChange = (id: string, field: keyof TypeDemandeConfig, value: any) => {
    setTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // Sauvegarde d'un type vers le backend
  const handleSaveType = async (type: TypeDemandeConfig) => {
    try {
      setSavingId(type.id);
      await demandesApi.updateTypeWorkflow(type.id, {
        workflowN1: type.workflowN1,
        workflowDrh: type.workflowDrh,
        workflowDg: type.workflowDg,
        seuilDgJours: Number(type.seuilDgJours) || 0,
        pieceRequise: type.pieceRequise,
        delaiMinJours: Number(type.delaiMinJours) || 0,
        dureeMaxJours: type.dureeMaxJours ? Number(type.dureeMaxJours) : null,
        description: type.description,
      });
      showToast(`Workflow du type « ${type.libelle} » enregistré avec succès !`, "success");
    } catch (err: any) {
      console.error("Erreur sauvegarde workflow:", err);
      showToast(err.message || "Erreur lors de la sauvegarde du circuit.", "error");
    } finally {
      setSavingId(null);
    }
  };

  // Réinitialisation globale aux circuits nominaux
  const handleResetDefaults = async () => {
    if (!confirm("Voulez-vous restaurer la configuration nominale par défaut pour tous les types ?")) {
      return;
    }
    try {
      setLoading(true);
      for (const t of types) {
        const isMissionOrConge = t.code === "CONGE_ANNUEL" || t.code === "ORDRE_MISSION";
        await demandesApi.updateTypeWorkflow(t.id, {
          workflowN1: true,
          workflowDrh: true,
          workflowDg: isMissionOrConge || t.code === "PERMISSION_ABSENCE",
          seuilDgJours: t.code === "PERMISSION_ABSENCE" ? 2 : 0,
          pieceRequise: t.code === "REPOS_MALADIE" || t.code === "CONGE_EXCEPTIONNEL",
        });
      }
      await loadTypes();
      showToast("Configuration nominale par défaut restaurée avec succès.", "success");
    } catch (err) {
      showToast("Erreur lors de la réinitialisation.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredTypes = types.filter((t) => {
    if (selectedCategory === "TOUS") return true;
    return t.categorie === selectedCategory;
  });

  const isDrhOrAdmin = ["DRH", "ADMIN", "AGENT_DRH"].includes(currentPersona.role);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* ── NOTIFICATION TOAST ── */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            toastMessage.type === "success"
              ? "bg-slate-900 text-white border border-slate-700"
              : "bg-red-600 text-white"
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${toastMessage.type === "success" ? "bg-emerald-400" : "bg-white"}`} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── EN-TÊTE PRINCIPAL ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F0822A] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#F0822A]" />
            Direction des Ressources Humaines • Pilotage Workflow
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Configuration des Circuits de Validation RH
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Personnalisez pour chaque type de demande le circuit d’approbation applicable (Manager N+1, Visa DRH, Accord DG avec seuil de jours, justificatifs requis).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDrhOrAdmin && (
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
              title="Restaurer la chaîne nominale par défaut"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Restaurer défaut</span>
            </button>
          )}

          <Link
            href="/absences"
            className="px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            <span>Retour Absences</span>
          </Link>
        </div>
      </div>

      {/* ── BANDEAU CHAÎNE HIÉRARCHIQUE NOMINALE ── */}
      <div className="bg-gradient-to-r from-orange-50 via-white to-orange-50/40 p-5 rounded-2xl border border-orange-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0822A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F0822A]"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#D96F1D]">
              Chaîne Hiérarchique & Acteurs Officiels en Vigueur
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            4 Paliers Définis • Agilly CI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Acteur 1 */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F0822A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              EK
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Étape 0 • Demandeur</div>
              <div className="text-xs font-bold text-slate-900 truncate">Samuel KOUAME</div>
              <div className="text-[11px] text-slate-500 truncate">Salarié (Demandeur)</div>
            </div>
          </div>

          {/* Acteur 2 */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              AT
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Étape 1 • Manager N+1</div>
              <div className="text-xs font-bold text-slate-900 truncate">Ange-Dieudonne TIANGBO</div>
              <div className="text-[11px] text-slate-500 truncate">Directeur Juridique & DPO</div>
            </div>
          </div>

          {/* Acteur 3 */}
          <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs flex items-center gap-3 bg-emerald-50/20">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              GY
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Étape 2 • Direction RH</div>
              <div className="text-xs font-bold text-slate-900 truncate">Germaine YAO</div>
              <div className="text-[11px] text-slate-500 truncate">Directrice des RH (DRH)</div>
            </div>
          </div>

          {/* Acteur 4 */}
          <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-xs flex items-center gap-3 bg-purple-50/20">
            <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              DA
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">Étape 3 • Direction Générale</div>
              <div className="text-xs font-bold text-slate-900 truncate">David Martial AKPA</div>
              <div className="text-[11px] text-slate-500 truncate">Directeur Exécutif & DG</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTRES PAR CATÉGORIE ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["TOUS", "CONGE", "PERMISSION", "MALADIE", "MISSION", "INTERVENTION"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-[#F0822A] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {cat === "TOUS" ? "Tous les types (6)" : CATEGORIE_CONFIG[cat]?.label || cat}
          </button>
        ))}
      </div>

      {/* ── LISTE DES TYPES DE DEMANDES AVEC CONFIGURATION WORKFLOW ── */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 border-3 border-[#F0822A] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-600">Chargement des circuits de validation...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredTypes.map((type) => {
            const catBadge = CATEGORIE_CONFIG[type.categorie] || {
              label: type.categorie,
              colorBg: "bg-slate-100",
              colorText: "text-slate-700",
              borderColor: "border-slate-200",
            };
            const isSaving = savingId === type.id;

            return (
              <div
                key={type.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-orange-300 transition-all duration-200 overflow-hidden"
              >
                {/* En-tête de la carte */}
                <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border ${catBadge.colorBg} ${catBadge.colorText} ${catBadge.borderColor}`}
                    >
                      {catBadge.label}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{type.libelle}</h3>
                      <span className="text-[11px] font-mono text-slate-400">Code API : {type.code}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {type.necessiteSolde && (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Décompte solde de congés
                      </span>
                    )}

                    <button
                      onClick={() => handleSaveType(type)}
                      disabled={isSaving || !isDrhOrAdmin}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs ${
                        isSaving
                          ? "bg-slate-400 text-white cursor-wait"
                          : !isDrhOrAdmin
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-[#F0822A] hover:bg-[#D96F1D] text-white active:scale-98"
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Enregistrement...</span>
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                          </svg>
                          <span>Enregistrer ce circuit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Colonne Gauche : Configuration des étapes (Toggles & Seuil) */}
                  <div className="lg:col-span-7 flex flex-col gap-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      1. Étapes de validation actives dans le circuit
                    </h4>

                    {/* Étape 1 : Avis N+1 */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${type.workflowN1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                          1
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Avis Responsable Hiérarchique (N+1)</div>
                          <div className="text-[11px] text-slate-500">Validation opérationnelle (Ange-Dieudonne TIANGBO)</div>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={type.workflowN1}
                          onChange={(e) => handleFieldChange(type.id, "workflowN1", e.target.checked)}
                          disabled={!isDrhOrAdmin}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F0822A]"></div>
                      </label>
                    </div>

                    {/* Étape 2 : Visa DRH */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${type.workflowDrh ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                          2
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Visa Ressources Humaines (DRH)</div>
                          <div className="text-[11px] text-slate-500">Contrôle conformité & réservation de solde (Germaine YAO)</div>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={type.workflowDrh}
                          onChange={(e) => handleFieldChange(type.id, "workflowDrh", e.target.checked)}
                          disabled={!isDrhOrAdmin}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F0822A]"></div>
                      </label>
                    </div>

                    {/* Étape 3 : Accord DG */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${type.workflowDg ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                            3
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">Accord Direction Générale (DG)</div>
                            <div className="text-[11px] text-slate-500">Arbitrage final et approbation exécutive (David Martial AKPA)</div>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={type.workflowDg}
                            onChange={(e) => handleFieldChange(type.id, "workflowDg", e.target.checked)}
                            disabled={!isDrhOrAdmin}
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F0822A]"></div>
                        </label>
                      </div>

                      {/* Seuil conditionnel DG */}
                      {type.workflowDg && (
                        <div className="ml-11 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-600">
                            Condition de sollicitation de la Direction Générale :
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500">
                              {type.seuilDgJours === 0 ? "Systématique pour toute durée" : `Uniquement si durée > ${type.seuilDgJours} jours`}
                            </span>
                            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                              <span className="px-2 text-[10px] text-slate-400 font-semibold bg-slate-50 border-r border-slate-200">
                                Seuil (j)
                              </span>
                              <input
                                type="number"
                                min="0"
                                max="30"
                                value={type.seuilDgJours}
                                onChange={(e) => handleFieldChange(type.id, "seuilDgJours", parseInt(e.target.value) || 0)}
                                disabled={!isDrhOrAdmin}
                                className="w-14 px-2 py-1 text-xs text-center font-bold text-slate-800 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Règles réglementaires */}
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">
                      2. Règles réglementaires & Justificatifs
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Justificatif obligatoire */}
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                        <span className="text-[11px] font-semibold text-slate-700">Pièce justificative</span>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px] text-slate-500">
                            {type.pieceRequise ? "Obligatoire" : "Facultative"}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={type.pieceRequise}
                              onChange={(e) => handleFieldChange(type.id, "pieceRequise", e.target.checked)}
                              disabled={!isDrhOrAdmin}
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-800"></div>
                          </label>
                        </div>
                      </div>

                      {/* Prévenance */}
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                        <span className="text-[11px] font-semibold text-slate-700">Prévenance minimale</span>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px] text-slate-500">Jours ouvrés</span>
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={type.delaiMinJours}
                            onChange={(e) => handleFieldChange(type.id, "delaiMinJours", parseInt(e.target.value) || 0)}
                            disabled={!isDrhOrAdmin}
                            className="w-14 px-2 py-0.5 text-xs text-center font-bold text-slate-800 border border-slate-300 rounded bg-white"
                          />
                        </div>
                      </div>

                      {/* Durée max */}
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                        <span className="text-[11px] font-semibold text-slate-700">Plafond durée max</span>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px] text-slate-500">Jours ouvrés</span>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={type.dureeMaxJours || ""}
                            placeholder="Illimité"
                            onChange={(e) => handleFieldChange(type.id, "dureeMaxJours", e.target.value ? parseInt(e.target.value) : null)}
                            disabled={!isDrhOrAdmin}
                            className="w-16 px-2 py-0.5 text-xs text-center font-bold text-slate-800 border border-slate-300 rounded bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Colonne Droite : Diagramme Visuel en Temps Réel */}
                  <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-slate-100/50 p-5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Aperçu Dynamique du Circuit
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#F0822A]/10 text-[#D96F1D] font-bold">
                          Temps Réel
                        </span>
                      </div>

                      {/* Circuit Visual Pipeline */}
                      <div className="flex flex-col gap-2.5 my-2">
                        {/* 0. Dépôt */}
                        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
                          <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                            ✓
                          </div>
                          <span className="font-semibold text-slate-800">Demandeur : Samuel KOUAME</span>
                          <span className="ml-auto text-[10px] text-slate-400">Soumission</span>
                        </div>

                        {/* Flèche */}
                        {type.workflowN1 && (
                          <>
                            <div className="w-0.5 h-3 bg-slate-300 mx-auto" />
                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-blue-50/80 border border-blue-200 text-xs">
                              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                                1
                              </div>
                              <span className="font-semibold text-blue-900">Avis N+1 : Ange Tiangbo</span>
                              <span className="ml-auto text-[10px] text-blue-600 font-medium">Requis</span>
                            </div>
                          </>
                        )}

                        {/* DRH */}
                        {type.workflowDrh && (
                          <>
                            <div className="w-0.5 h-3 bg-slate-300 mx-auto" />
                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs">
                              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                                2
                              </div>
                              <span className="font-semibold text-emerald-900">Visa DRH : Germaine YAO</span>
                              <span className="ml-auto text-[10px] text-emerald-600 font-medium">Requis</span>
                            </div>
                          </>
                        )}

                        {/* DG */}
                        {type.workflowDg && (
                          <>
                            <div className="w-0.5 h-3 bg-slate-300 mx-auto" />
                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-purple-50/80 border border-purple-200 text-xs">
                              <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                                3
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-purple-900">Accord DG : David Martial AKPA</span>
                                <span className="text-[10px] text-purple-600">
                                  {type.seuilDgJours === 0 ? "Systématique" : `Si durée > ${type.seuilDgJours} jours`}
                                </span>
                              </div>
                              <span className="ml-auto text-[10px] text-purple-600 font-medium">Direction</span>
                            </div>
                          </>
                        )}

                        {/* 4. Clôture */}
                        <div className="w-0.5 h-3 bg-slate-300 mx-auto" />
                        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#F0822A]/10 border border-[#F0822A]/30 text-xs">
                          <div className="w-5 h-5 rounded-full bg-[#F0822A] text-white flex items-center justify-center font-bold text-[10px]">
                            ★
                          </div>
                          <span className="font-semibold text-orange-950">Édition Titre & Archivage GED</span>
                          <span className="ml-auto text-[10px] text-[#D96F1D] font-bold">Approuvée</span>
                        </div>
                      </div>
                    </div>

                    {/* Consignes DRH modifiables */}
                    <div className="mt-4 pt-3 border-t border-slate-200/80">
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Consignes DRH affichées au collaborateur :
                      </label>
                      <textarea
                        rows={2}
                        value={type.description || ""}
                        onChange={(e) => handleFieldChange(type.id, "description", e.target.value)}
                        disabled={!isDrhOrAdmin}
                        placeholder="Ex: Merci de déposer cette demande au moins 48h à l'avance..."
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none focus:border-[#F0822A] resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

