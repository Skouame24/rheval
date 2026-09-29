// ============================================================
// features/evaluation/components/FicheEvaluationModal.tsx
// Fiche d'Évaluation Officielle AGILLY — Design Soft UI Enterprise
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { WorkflowStepper } from "@/components/shared/WorkflowStepper";
import { useAuth } from "@/contexts/AuthContext";
import { exportEvaluationToExcel } from "@/lib/utils/exportExcelEvaluation";
import { evaluationsApi } from "@/lib/api/evaluations.api";

interface FicheEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
  isAutoEvaluationMode?: boolean;
  isVisaMode?: boolean;
  currentStep?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  dossier?: {
    id?: string;
    nom: string;
    prenom: string;
    poste: string;
    direction?: string;
    [key: string]: any;
  } | null;
  evaluationId?: string;
  objectifs?: any[];
  onSaved?: () => void;
}

interface ObjectifData {
  id: string;
  numero: number;
  intitule: string;
  ponderation: number;
  noteSalarie: number;
  commentaireSalarie: string;
  noteObtenue: number;
  commentaire: string;
  trancheSelectionnee: string;
  criteres: {
    tranche: string;
    label: string;
    color: string;
    bg: string;
    border: string;
    min: number;
    max: number;
    defaultNote: number;
    texte: string;
  }[];
}

const INITIAL_OBJECTIFS: ObjectifData[] = [];

export function FicheEvaluationModal({
  isOpen,
  onClose,
  readOnly = false,
  isAutoEvaluationMode = false,
  isVisaMode = false,
  currentStep = 4,
  dossier,
  evaluationId,
  objectifs: apiObjectifs,
  onSaved,
}: FicheEvaluationModalProps) {
  const { user, role } = useAuth();
  const [objectifs, setObjectifs] = useState<ObjectifData[]>(INITIAL_OBJECTIFS);
  const [activeTab, setActiveTab] = useState<"N1" | "SALARIE">("SALARIE");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [fetchedEval, setFetchedEval] = useState<any | null>(null);

  // Formations préconisées par le N+1
  const [formations, setFormations] = useState<Array<{
    id?: string;
    intitule: string;
    delai?: string;
    priorite?: string;
    objectifVise?: string;
    statut?: string;
  }>>([]);
  const [newFormationIntitule, setNewFormationIntitule] = useState("");
  const [newFormationDelai, setNewFormationDelai] = useState("Court terme (1 à 3 mois)");
  const [newFormationPriorite, setNewFormationPriorite] = useState<"HAUTE" | "MOYENNE" | "BASSE">("MOYENNE");
  const [newFormationObjectif, setNewFormationObjectif] = useState("");
  const [isAddingFormation, setIsAddingFormation] = useState(false);
  const [showAddFormationForm, setShowAddFormationForm] = useState(false);

  // Synchronisation des formations depuis fetchedEval ou dossier
  useEffect(() => {
    if (fetchedEval?.formations && Array.isArray(fetchedEval.formations)) {
      setFormations(fetchedEval.formations);
    } else if ((dossier as any)?.formations && Array.isArray((dossier as any).formations)) {
      setFormations((dossier as any).formations);
    }
  }, [fetchedEval?.formations, (dossier as any)?.formations]);

  const isSalarie = role === "SALARIE";

  const effectiveObjectifs = (apiObjectifs && apiObjectifs.length > 0) ? apiObjectifs : (fetchedEval?.objectifs ?? []);
  const effectiveDossier = dossier || (fetchedEval?.salarie ? {
    id: fetchedEval.salarie.id,
    ficheId: fetchedEval.id,
    nom: fetchedEval.salarie.nom,
    prenom: fetchedEval.salarie.prenom,
    poste: fetchedEval.salarie.poste,
    direction: (fetchedEval.salarie as any)?.direction,
  } : null);

  // Identifiant de la fiche d'évaluation résolu avec plusieurs fallbacks de sécurité
  const resolvedFicheId =
    evaluationId ||
    (dossier as any)?.ficheId ||
    (dossier as any)?.evaluationId ||
    (effectiveObjectifs?.[0] as any)?.ficheId ||
    fetchedEval?.id ||
    dossier?.id ||
    "";

  // Détermination des droits d'édition
  // Sur l'onglet SALARIE : le collaborateur peut s'auto-évaluer s'il est salarié ou en mode auto-évaluation
  const canEditSalarie = activeTab === "SALARIE" && (isAutoEvaluationMode || isSalarie || !readOnly);
  // Sur l'onglet N1 : le manager / admin / RH peut saisir les notes N1
  const canEditN1 = activeTab === "N1" && (role === "N1" || role === "ADMIN" || role === "RH" || (!readOnly && !isSalarie));
  const canEdit = activeTab === "SALARIE" ? canEditSalarie : canEditN1;

  // Récupération automatique si seule l'ID est fournie
  useEffect(() => {
    if (isOpen && resolvedFicheId && (!apiObjectifs || apiObjectifs.length === 0)) {
      evaluationsApi.getById(resolvedFicheId).then((data) => {
        if (data) setFetchedEval(data);
      });
    } else if (!isOpen) {
      setFetchedEval(null);
    }
  }, [isOpen, resolvedFicheId, apiObjectifs]);

  // Clé stable basée sur le contenu réel (IDs) — immune aux références instables
  const apiObjectifsKey = effectiveObjectifs?.map((o: any) => o.id).join(",") ?? "";

  // Initialisation de l'onglet par défaut
  useEffect(() => {
    if (isAutoEvaluationMode || isSalarie) {
      setActiveTab("SALARIE");
    } else {
      setActiveTab("N1");
    }
  }, [isAutoEvaluationMode, isSalarie, isOpen]);

  useEffect(() => {
    // Guard: si aucun objectif on réinitialise
    if (!effectiveObjectifs || effectiveObjectifs.length === 0) {
      setObjectifs(INITIAL_OBJECTIFS);
      return;
    }

    const salarieId = effectiveDossier?.id || (effectiveDossier as any)?.salarieId || (effectiveDossier as any)?.userId || user?.id;
    const count = effectiveObjectifs.length || 1;
    const defaultPond = Math.round(100 / count);

    setObjectifs(effectiveObjectifs.map((obj: any, idx: number) => {
      // Résolution intelligente des évaluations passées
      const evalSalarie = obj.evaluations?.find((e: any) => 
        (salarieId && e.examinateurId === salarieId) || e.type === "SALARIE"
      ) || {};

      const evalN1 = obj.evaluations?.find((e: any) => 
        (!salarieId || e.examinateurId !== salarieId) && e.type !== "SALARIE"
      ) || {};

      const noteSal = obj.noteSalarie != null 
        ? Number(obj.noteSalarie) 
        : (evalSalarie.note != null ? Number(evalSalarie.note) : 0);

      const commentSal = obj.commentaireSalarie || evalSalarie.observation || "";

      const noteN1 = obj.noteObtenue != null 
        ? Number(obj.noteObtenue) 
        : (evalN1.note != null ? Number(evalN1.note) : (obj.note != null ? Number(obj.note) : 0));

      const commentN1 = obj.commentaire || evalN1.observation || "";

      const rawPond = Number(obj.ponderation);
      const finalPond = (Number.isFinite(rawPond) && rawPond > 0) ? rawPond : defaultPond;

      return {
        id: obj.id,
        ficheId: obj.ficheId || resolvedFicheId,
        numero: idx + 1,
        intitule: obj.intitule,
        ponderation: finalPond,
        noteSalarie: noteSal,
        commentaireSalarie: commentSal,
        noteObtenue: noteN1,
        commentaire: commentN1,
        trancheSelectionnee: "",
        criteres: [
          {
            tranche: "18 à 20",
            label: "Excellence",
            color: "#10B981",
            bg: "#ECFDF5",
            border: "#10B981",
            min: 18,
            max: 20,
            defaultNote: 19,
            texte: obj.indicateurs?.[0]?.intitule || "Performance exceptionnelle et objectifs dépassés"
          },
          {
            tranche: "15 à 17",
            label: "Très Bon",
            color: "#3B82F6",
            bg: "#EFF6FF",
            border: "#3B82F6",
            min: 15,
            max: 17,
            defaultNote: 16,
            texte: "Objectif atteint avec succès et régularité"
          },
          {
            tranche: "12 à 14",
            label: "Satisfaisant",
            color: "#F59E0B",
            bg: "#FFFBEB",
            border: "#F59E0B",
            min: 12,
            max: 14,
            defaultNote: 13,
            texte: "Objectif partiellement atteint, axes d'amélioration"
          },
          {
            tranche: "0 à 11",
            label: "Insuffisant",
            color: "#EF4444",
            bg: "#FEF2F2",
            border: "#EF4444",
            min: 0,
            max: 11,
            defaultNote: 8,
            texte: "Objectif non atteint, actions correctives requises"
          }
        ]
      };
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiObjectifsKey, effectiveDossier?.id, user?.id]);

  const collabNom = effectiveDossier ? `${effectiveDossier.prenom} ${effectiveDossier.nom}` : (user ? `${user.prenom} ${user.nom}` : "Collaborateur Agilly");
  const collabInitials = effectiveDossier ? `${effectiveDossier.prenom.charAt(0)}${effectiveDossier.nom.charAt(0)}` : (user ? `${user.prenom.charAt(0)}${user.nom.charAt(0)}` : "AG");
  const collabPoste = effectiveDossier ? `${effectiveDossier.poste}${effectiveDossier.direction ? ` · ${effectiveDossier.direction}` : ""}` : (user ? `${user.poste || "Collaborateur"} · ${user.departement || "Direction Générale"}` : "Collaborateur Agilly");

  // Visa Salarié State
  const [visaSalarieAccord, setVisaSalarieAccord] = useState<boolean | null>(true);
  const [visaSalarieObservation, setVisaSalarieObservation] = useState("");
  const [visaSalarieSubmitted, setVisaSalarieSubmitted] = useState(false);

  if (!isOpen) return null;

  // Calcul dynamique de la Note Globale Pondérée N+1 et Salarié avec fallback division-par-zéro
  const totalPond = objectifs.reduce((acc, o) => acc + (Number(o.ponderation) || 0), 0);

  const noteGlobaleN1 = totalPond > 0
    ? objectifs.reduce((acc, obj) => {
        return acc + (Number(obj.noteObtenue || 0) * (Number(obj.ponderation || 0) / 100));
      }, 0)
    : (objectifs.length > 0
        ? objectifs.reduce((acc, obj) => acc + Number(obj.noteObtenue || 0), 0) / objectifs.length
        : 0);

  const noteGlobaleSalarie = totalPond > 0
    ? objectifs.reduce((acc, obj) => {
        return acc + (Number(obj.noteSalarie || 0) * (Number(obj.ponderation || 0) / 100));
      }, 0)
    : (objectifs.length > 0
        ? objectifs.reduce((acc, obj) => acc + Number(obj.noteSalarie || 0), 0) / objectifs.length
        : 0);

  const noteAffichee = activeTab === "SALARIE" ? noteGlobaleSalarie : noteGlobaleN1;
  const tauxGlobal = ((noteAffichee / 20) * 100).toFixed(1);

  // Gestion du clic sur une tranche de barème
  const handleSelectTranche = (objId: string, critere: { tranche: string; min: number; max: number; defaultNote: number }) => {
    if (!canEdit) return;

    setObjectifs((prev) =>
      prev.map((o) => {
        if (o.id === objId) {
          const currentNote = activeTab === "SALARIE" ? o.noteSalarie : o.noteObtenue;
          const isNoteInTier = currentNote >= critere.min && currentNote <= critere.max;
          const newNote = isNoteInTier && currentNote > 0 ? currentNote : critere.defaultNote;

          if (activeTab === "SALARIE") {
            return {
              ...o,
              noteSalarie: newNote,
              trancheSelectionnee: critere.tranche,
            };
          } else {
            return {
              ...o,
              trancheSelectionnee: critere.tranche,
              noteObtenue: newNote,
            };
          }
        }
        return o;
      })
    );
  };

  // Ajustement manuel de la note avec calcul dynamique
  const handleNoteChange = (objId: string, valStr: string) => {
    if (!canEdit) return;
    const val = parseFloat(valStr) || 0;
    const clampedVal = Math.min(20, Math.max(0, val));

    setObjectifs((prev) =>
      prev.map((o) => {
        if (o.id === objId) {
          const matchedCritere = o.criteres.find(
            (c) => clampedVal >= c.min && clampedVal <= c.max
          ) || o.criteres[o.criteres.length - 1];

          if (activeTab === "SALARIE") {
            return {
              ...o,
              noteSalarie: clampedVal,
              trancheSelectionnee: matchedCritere?.tranche || "",
            };
          } else {
            return {
              ...o,
              noteObtenue: clampedVal,
              trancheSelectionnee: matchedCritere?.tranche || "",
            };
          }
        }
        return o;
      })
    );
  };

  const handleCommentaireChange = (objId: string, text: string) => {
    if (!canEdit) return;
    setObjectifs((prev) =>
      prev.map((o) => {
        if (o.id === objId) {
          return activeTab === "SALARIE"
            ? { ...o, commentaireSalarie: text }
            : { ...o, commentaire: text };
        }
        return o;
      })
    );
  };

  const handleAddFormation = async () => {
    if (!newFormationIntitule.trim()) {
      alert("Veuillez renseigner l'intitulé de la formation recommandée.");
      return;
    }

    const item = {
      id: `temp-${Date.now()}`,
      intitule: newFormationIntitule.trim(),
      delai: newFormationDelai || "Court terme (1 à 3 mois)",
      priorite: newFormationPriorite,
      objectifVise: newFormationObjectif.trim(),
      statut: "DEMANDE",
    };

    setFormations((prev) => [...prev, item]);
    setNewFormationIntitule("");
    setNewFormationObjectif("");
    setShowAddFormationForm(false);

    const targetFicheId =
      resolvedFicheId ||
      fetchedEval?.id ||
      (objectifs?.[0] as any)?.ficheId ||
      (effectiveObjectifs?.[0] as any)?.ficheId;

    if (targetFicheId) {
      try {
        setIsAddingFormation(true);
        const res = await evaluationsApi.addFormation(targetFicheId, {
          intitule: item.intitule,
          delai: item.delai,
          priorite: item.priorite,
          objectifVise: item.objectifVise,
        });
        if (res?.id) {
          setFormations((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, id: res.id } : f))
          );
        }
      } catch (err) {
        console.error("[FicheEvaluationModal] Erreur ajout formation:", err);
      } finally {
        setIsAddingFormation(false);
      }
    }
  };

  const handleDeleteFormation = async (formationId?: string, index?: number) => {
    if (!confirm("Voulez-vous retirer cette formation du plan d'action ?")) return;
    setFormations((prev) => prev.filter((f, idx) => (formationId ? f.id !== formationId : idx !== index)));

    const targetFicheId =
      resolvedFicheId ||
      fetchedEval?.id ||
      (objectifs?.[0] as any)?.ficheId;

    if (targetFicheId && formationId && !formationId.startsWith("temp-")) {
      try {
        await evaluationsApi.deleteFormation(targetFicheId, formationId);
      } catch (err) {
        console.error("[FicheEvaluationModal] Erreur suppression formation:", err);
      }
    }
  };

  const handleSaveEvaluation = async () => {
    const targetFicheId =
      resolvedFicheId ||
      fetchedEval?.id ||
      (objectifs?.[0] as any)?.ficheId ||
      (effectiveObjectifs?.[0] as any)?.ficheId;

    if (!targetFicheId) {
      alert("⚠️ Aucune fiche d'évaluation associée n'a été trouvée pour enregistrer.");
      return;
    }
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      if (activeTab === "SALARIE") {
        await evaluationsApi.submitAutoEvaluation(targetFicheId, {
          notes: objectifs.map((o) => ({
            objectifId: o.id,
            note: o.noteSalarie,
            commentaire: o.commentaireSalarie,
          })),
          observations: visaSalarieObservation,
        });
        setSaveSuccessMsg("✓ Votre auto-évaluation a été enregistrée avec succès dans la base de données !");
      } else {
        await evaluationsApi.submitNotesN1(targetFicheId, {
          evaluationCycleId: targetFicheId,
          notes: objectifs.map((o) => ({
            objectifId: o.id,
            note: o.noteObtenue,
            commentaire: o.commentaire,
          })),
          formations: formations.map((f) => ({
            id: f.id,
            intitule: f.intitule,
            delai: f.delai,
            priorite: f.priorite,
            objectifVise: f.objectifVise,
          })),
          observations: "",
        });
        setSaveSuccessMsg("✓ L'évaluation N+1 et le plan de formation ont été enregistrés avec succès dans la base de données !");
      }
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error("[FicheEvaluationModal] Save error:", err);
      alert("Erreur lors de l'enregistrement : " + (err.message || "Erreur serveur"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitVisa = async () => {
    if (visaSalarieAccord === null) {
      alert("Veuillez sélectionner soit 'Accord (OK)', soit 'Désaccord (NON OK)'.");
      return;
    }
    const targetFicheId =
      resolvedFicheId ||
      fetchedEval?.id ||
      (objectifs?.[0] as any)?.ficheId ||
      (effectiveObjectifs?.[0] as any)?.ficheId;

    if (!targetFicheId) {
      alert("⚠️ Aucune fiche d'évaluation trouvée pour apposer votre visa.");
      return;
    }
    try {
      await evaluationsApi.signSalarie(targetFicheId, {
        observation: visaSalarieObservation || (visaSalarieAccord ? "Accord du salarié sur l'évaluation N+1" : "Désaccord du salarié sur l'évaluation N+1"),
      });
      setVisaSalarieSubmitted(true);
      alert(
        visaSalarieAccord
          ? "✓ Votre Visa 'Accord (OK)' sur l'évaluation N+1 a été enregistré avec succès dans la base de données !"
          : "⚠️ Votre Visa 'Désaccord (NON OK)' a été enregistré. Le dossier passe en revue N+2 / RH."
      );
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error("[FicheEvaluationModal] Sign error:", err);
      alert("Erreur lors de la signature : " + (err.message || "Erreur serveur"));
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(15, 23, 42, 0.65)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px 24px",
    }}>
      <div style={{
        background: "#FFFFFF",
        width: "100%",
        maxWidth: 1120,
        maxHeight: "94vh",
        borderRadius: 0,
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', 'IBM Plex Sans', sans-serif"
      }}>

        {/* ── TOP ACCENT BRAND BAR ── */}
        <div style={{ height: 6, width: "100%", background: activeTab === "SALARIE" ? "#0284C7" : "#F0822A" }} />

        {/* ── HEADER MODAL ── */}
        <div style={{
          padding: "18px 32px",
          background: "#FFFFFF",
          borderBottom: "1px solid #F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 0,
              background: activeTab === "SALARIE" ? "#EFF6FF" : "#FFF7ED",
              border: `1px solid ${activeTab === "SALARIE" ? "#0284C7" : "#F0822A"}`,
              color: activeTab === "SALARIE" ? "#0284C7" : "#F0822A",
              fontWeight: 900,
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              A
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: -0.5 }}>
                  Fiche d'Évaluation de Performance Officielle
                </h2>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981", background: "#ECFDF5", padding: "4px 10px", borderRadius: 0, border: "1px solid #10B98130" }}>
                  🟢 Document Officiel Actif
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#64748B", margin: "2px 0 0 0", fontWeight: 600 }}>
                AGILLY RHEVAL · Campagne Annuelle 2026 · Format Conforme Excel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 0,
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              color: "#64748B",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >✕</button>
        </div>

        {/* ── BANNIÈRE SUCCÈS D'ENREGISTREMENT ── */}
        {saveSuccessMsg && (
          <div style={{
            padding: "12px 32px",
            background: "#ECFDF5",
            borderBottom: "1px solid #10B981",
            color: "#065F46",
            fontSize: 13,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span>{saveSuccessMsg}</span>
            <button onClick={() => setSaveSuccessMsg(null)} style={{ background: "none", border: "none", color: "#065F46", cursor: "pointer", fontWeight: 900 }}>✕</button>
          </div>
        )}

        {/* ── TOGGLE ONGLET VUE MANAGER N+1 VS AUTO-ÉVALUATION SALARIÉ ── */}
        <div style={{
          padding: "10px 32px",
          background: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          flexShrink: 0
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setActiveTab("SALARIE")}
              style={{
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 800,
                borderRadius: 0,
                border: activeTab === "SALARIE" ? "2px solid #0284C7" : "1px solid #CBD5E1",
                background: activeTab === "SALARIE" ? "#F0F9FF" : "#FFFFFF",
                color: activeTab === "SALARIE" ? "#0284C7" : "#64748B",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              ✍️ Auto-évaluation Salarié ({noteGlobaleSalarie.toFixed(2)}/20)
            </button>

            <button
              onClick={() => setActiveTab("N1")}
              style={{
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 800,
                borderRadius: 0,
                border: activeTab === "N1" ? "2px solid #F0822A" : "1px solid #CBD5E1",
                background: activeTab === "N1" ? "#FFF7ED" : "#FFFFFF",
                color: activeTab === "N1" ? "#F0822A" : "#64748B",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              📊 Évaluation Manager N+1 ({noteGlobaleN1.toFixed(2)}/20)
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {canEditSalarie && (
              <span style={{ fontSize: 11, fontWeight: 800, color: "#0284C7", background: "#E0F2FE", padding: "4px 10px" }}>
                ✓ Mode Saisie Activé (Cliquez sur les tranches ou saisissez vos notes)
              </span>
            )}
            {canEditN1 && (
              <span style={{ fontSize: 11, fontWeight: 800, color: "#EA580C", background: "#FFEDD5", padding: "4px 10px" }}>
                ✓ Mode Notation N+1 Activé
              </span>
            )}
          </div>
        </div>

        {/* ── BODY SCROLLABLE ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24, background: "#F7F8FA" }}>
          
          {/* STEPPER DE WORKFLOW 8 ÉTAPES */}
          <WorkflowStepper currentStep={currentStep} />

          {/* SECTION 1 : HERO SALARIÉ CARD */}
          <div style={{
            background: "#FFFFFF",
            padding: 24,
            borderRadius: 0,
            border: "1px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            gap: 20
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 0,
                  background: activeTab === "SALARIE" ? "#0284C7" : "#F0822A",
                  color: "#FFFFFF",
                  fontSize: 22,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #FFFFFF"
                }}>
                  {collabInitials}
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 900, color: activeTab === "SALARIE" ? "#0284C7" : "#F0822A", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                    Fiche du Collaborateur
                  </span>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: "#000000", margin: "2px 0 0 0", letterSpacing: -0.5 }}>
                    {collabNom}
                  </h3>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b", margin: "2px 0 0 0" }}>
                    {collabPoste}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <TagChip icon="🆔" label="Matricule" value={dossier ? "—" : (user?.id ? `AGY-${user.id.replace(/-/g,"").slice(-6).toUpperCase()}` : "—")} />
                <TagChip icon="📍" label="Département" value={dossier?.direction ?? user?.departement ?? "—"} />
                <TagChip icon="📅" label="Cycle" value={"Campagne Annuelle 2026"} />
              </div>
            </div>

            {/* Manager N+1 & Auto-éval Info Box */}
            <div style={{
              background: "#FFF7ED",
              padding: "14px 20px",
              borderRadius: 0,
              border: "1px solid #FFEDD5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>👨‍💼</span>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 900, color: "#EA580C", textTransform: "uppercase" }}>Supérieur Hiérarchique (N+1)</span>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#000000", margin: 0 }}>
                    {dossier
                      ? (dossier.n1 || "Direction")
                      : user?.n1
                        ? `${user.n1.prenom} ${user.n1.nom}${user.n1.poste ? ` (${user.n1.poste})` : ""}`
                        : "Non renseigné"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#0284C7", background: "#E0F2FE", padding: "4px 10px", borderRadius: 0 }}>
                  Auto-éval Salarié : {noteGlobaleSalarie.toFixed(2)}/20
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", background: "#D1FAE5", padding: "4px 10px", borderRadius: 0 }}>
                  Note N+1 : {noteGlobaleN1.toFixed(2)}/20
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2 : GRILLE D'OBJECTIFS DE PERFORMANCE */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#000000", margin: 0, letterSpacing: -0.4 }}>
                  2. Grille des Objectifs & Barème de Notation {activeTab === "SALARIE" ? "(Auto-évaluation)" : "(Manager N+1)"}
                </h3>
                <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>
                  Cliquez sur l'une des 4 tranches pour attribuer le niveau d'atteinte et ajustez la note si nécessaire
                </p>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#F0822A", background: "#FFF7ED", padding: "6px 14px", borderRadius: 0, border: "1px solid #FFEDD5" }}>
                  {objectifs.length} Objectif{objectifs.length > 1 ? "s" : ""} · Total {objectifs.reduce((s, o) => s + (o.ponderation ?? 0), 0)}%
                </span>

                {canEdit && (
                  <button
                    onClick={handleSaveEvaluation}
                    disabled={isSaving}
                    style={{
                      padding: "8px 16px",
                      background: activeTab === "SALARIE" ? "#0284C7" : "#F0822A",
                      color: "#FFFFFF",
                      border: "none",
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    {isSaving ? "Sauvegarde..." : activeTab === "SALARIE" ? "💾 Enregistrer mon Auto-Évaluation" : "💾 Enregistrer N+1"}
                  </button>
                )}
              </div>
            </div>

            {objectifs.length === 0 ? (
              <div style={{ background: "#FFFFFF", padding: 28, borderRadius: 0, border: "1px solid #E2E8F0", textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "#64748b", margin: 0, fontWeight: 600 }}>Aucun objectif fixé pour ce collaborateur.</p>
              </div>
            ) : (
              objectifs.map((obj) => {
              const currentNote = activeTab === "SALARIE" ? obj.noteSalarie : obj.noteObtenue;
              const currentComment = activeTab === "SALARIE" ? obj.commentaireSalarie : obj.commentaire;

              return (
                <div 
                  key={obj.id} 
                  style={{
                    background: "#FFFFFF",
                    padding: 28,
                    borderRadius: 0,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  {/* Header Objectif */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 900, color: "#F0822A", background: "#FFF7ED", padding: "4px 10px", borderRadius: 0, border: "1px solid #FFEDD5" }}>
                          OBJECTIF DE PERFORMANCE 0{obj.numero}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                          Pondération : <strong style={{ color: "#F0822A" }}>{obj.ponderation}%</strong>
                        </span>
                      </div>
                      <h4 style={{ fontSize: 17, fontWeight: 900, color: "#000000", margin: 0, lineHeight: 1.3 }}>
                        {obj.intitule}
                      </h4>
                    </div>

                    {/* Comparateur Side-by-Side Auto-Note Salarié vs Note N+1 */}
                    <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                      <div style={{ background: "#F0F9FF", padding: "8px 14px", borderRadius: 0, border: "1px solid #BAE6FD", textAlign: "right" }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: "#0284C7", textTransform: "uppercase", display: "block" }}>Auto-Note Salarié</span>
                        <span style={{ fontSize: 18, fontWeight: 900, color: "#0369A1" }}>{obj.noteSalarie} <span style={{ fontSize: 11, color: "#94a3b8" }}>/20</span></span>
                      </div>
                      <div style={{ background: "#FFF7ED", padding: "8px 14px", borderRadius: 0, border: "1px solid #FFEDD5", textAlign: "right" }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: "#EA580C", textTransform: "uppercase", display: "block" }}>Note N+1 Manager</span>
                        <span style={{ fontSize: 18, fontWeight: 900, color: "#F0822A" }}>{obj.noteObtenue} <span style={{ fontSize: 11, color: "#94a3b8" }}>/20</span></span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Tranches d'Indicateurs Stylisées Cliquables */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px 0" }}>
                      Sélectionner la tranche de réalisation {activeTab === "SALARIE" ? "(Auto-évaluation)" : "(Note N+1)"} :
                    </p>

                    {obj.criteres.map((c, i) => {
                      const isSelected = currentNote >= c.min && currentNote <= c.max && currentNote > 0;
                      return (
                        <div 
                          key={i} 
                          onClick={() => handleSelectTranche(obj.id, c)}
                          style={{
                            padding: "16px 20px",
                            borderRadius: 0,
                            border: isSelected ? `2px solid ${c.color}` : "1px solid #E2E8F0",
                            background: isSelected ? c.bg : "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            cursor: canEdit ? "pointer" : "default",
                            transition: "all 0.2s ease",
                            boxShadow: isSelected ? `0 4px 16px ${c.color}22` : "none",
                          }}
                        >
                          <div style={{
                            width: 22,
                            height: 22,
                            borderRadius: 0,
                            border: isSelected ? `6px solid ${c.color}` : "2px solid #CBD5E1",
                            background: "#FFFFFF",
                            flexShrink: 0,
                          }} />

                          <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "6px 12px",
                            borderRadius: 0,
                            background: isSelected ? c.color : "#F1F5F9",
                            color: isSelected ? "#FFFFFF" : "#475569",
                            flexShrink: 0,
                            minWidth: 84
                          }}>
                            <span style={{ fontSize: 12, fontWeight: 900 }}>{c.tranche}</span>
                            <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", opacity: 0.9 }}>{c.label}</span>
                          </div>

                          <span style={{ fontSize: 13, fontWeight: isSelected ? 800 : 500, color: isSelected ? "#000000" : "#475569", flex: 1, lineHeight: 1.4 }}>
                            {c.texte}
                          </span>

                          {isSelected && (
                            <span style={{
                              fontSize: 11,
                              fontWeight: 900,
                              color: c.color,
                              background: "#FFFFFF",
                              padding: "4px 10px",
                              borderRadius: 0,
                              border: `1px solid ${c.border}`,
                            }}>
                              ✓ Sélectionné
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Saisie de la Note exacte & Commentaire */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 18, background: "#F8FAFC", padding: 18, borderRadius: 0, border: "1px solid #E2E8F0" }}>
                    <div style={{ width: 190, flexShrink: 0 }}>
                      <label style={{ fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                        Ajuster la Note /20 ({activeTab === "SALARIE" ? "Auto-note" : "N+1"})
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          disabled={!canEdit}
                          value={currentNote}
                          onChange={(e) => handleNoteChange(obj.id, e.target.value)}
                          style={{
                            width: 86,
                            height: 44,
                            fontSize: 18,
                            fontWeight: 900,
                            color: "#000000",
                            background: "#FFFFFF",
                            border: activeTab === "SALARIE" ? "2px solid #0284C7" : "2px solid #F0822A",
                            borderRadius: 0,
                            textAlign: "center",
                            outline: "none",
                          }}
                        />
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#94a3b8" }}>/ 20</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 240 }}>
                      <label style={{ fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                        {activeTab === "SALARIE" ? "Auto-commentaire du Salarié" : "Commentaires & Justification du N+1"}
                      </label>
                      <textarea
                        rows={2}
                        disabled={!canEdit}
                        value={currentComment}
                        onChange={(e) => handleCommentaireChange(obj.id, e.target.value)}
                        placeholder={activeTab === "SALARIE" ? "Commenter votre réalisation sur cet objectif..." : "Ajouter une appréciation ou justification..."}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#000000",
                          background: "#FFFFFF",
                          border: "1px solid #CBD5E1",
                          borderRadius: 0,
                          outline: "none",
                          resize: "vertical"
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            }))}
          </div>

          {/* SECTION 3 : FORMATION À ENVISAGER & PLAN DE DÉVELOPPEMENT */}
          <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 0, border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#F0822A", margin: 0 }}>
                  3. Plan de Formation Recommandé & Développement des Compétences
                </h3>
                <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>
                  Préconisations émises par le manager lors de l'entretien annuel pour accompagner les compétences du collaborateur
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#0284C7", background: "#E0F2FE", padding: "4px 10px", borderRadius: 0, border: "1px solid #BAE6FD" }}>
                  {formations.length} formation{formations.length > 1 ? "s" : ""} identifiée{formations.length > 1 ? "s" : ""}
                </span>
                {canEditN1 && (
                  <button
                    type="button"
                    onClick={() => setShowAddFormationForm(!showAddFormationForm)}
                    style={{
                      padding: "6px 14px",
                      background: showAddFormationForm ? "#F1F5F9" : "#F0822A",
                      color: showAddFormationForm ? "#475569" : "#FFFFFF",
                      border: showAddFormationForm ? "1px solid #CBD5E1" : "none",
                      borderRadius: 0,
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {showAddFormationForm ? "✕ Masquer le formulaire" : "+ Ajouter un besoin de formation"}
                  </button>
                )}
              </div>
            </div>

            {/* FORMULAIRE D'AJOUT DE FORMATION (N+1) */}
            {showAddFormationForm && canEditN1 && (
              <div style={{
                background: "#FFF7ED",
                border: "2px solid #F0822A",
                padding: 20,
                marginBottom: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: 13, fontWeight: 900, color: "#C2410C", margin: 0, textTransform: "uppercase" }}>
                    🎯 Nouvelle Préconisation de Formation (N+1)
                  </h4>
                  <span style={{ fontSize: 11, color: "#9A3412", fontWeight: 700 }}>Renseignez l'intitulé et les détails</span>
                </div>

                {/* Suggestions thématiques rapides */}
                <div>
                  <label style={{ fontSize: 10, fontWeight: 900, color: "#9A3412", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    Suggestions thématiques rapides (cliquez pour insérer) :
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {[
                      "Cloud Azure & Microservices",
                      "Cybersécurité & SSO Entra ID",
                      "Management d'Équipe & Leadership",
                      "Méthodologies Agiles / Scrum",
                      "Architecture React, Next.js & TypeScript",
                      "DevOps, Docker & CI/CD",
                      "Communication & Négociation Pro",
                    ].map((sugg) => (
                      <button
                        key={sugg}
                        type="button"
                        onClick={() => setNewFormationIntitule(sugg)}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "4px 9px",
                          background: "#FFFFFF",
                          border: "1px solid #FDBA74",
                          color: "#C2410C",
                          cursor: "pointer",
                        }}
                      >
                        + {sugg}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 900, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                      Intitulé de la formation *
                    </label>
                    <input
                      type="text"
                      value={newFormationIntitule}
                      onChange={(e) => setNewFormationIntitule(e.target.value)}
                      placeholder="ex: Sécurité Cloud & Architecture Microservices"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        fontSize: 13,
                        fontWeight: 600,
                        border: "1px solid #CBD5E1",
                        background: "#FFFFFF",
                        borderRadius: 0,
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 10, fontWeight: 900, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                      Échéance / Délai souhaité
                    </label>
                    <select
                      value={newFormationDelai}
                      onChange={(e) => setNewFormationDelai(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        fontSize: 13,
                        fontWeight: 700,
                        border: "1px solid #CBD5E1",
                        background: "#FFFFFF",
                        borderRadius: 0,
                        outline: "none",
                        color: "#0F172A",
                      }}
                    >
                      <option value="Court terme (1 à 3 mois)">Court terme (1 à 3 mois)</option>
                      <option value="Moyen terme (3 à 6 mois)">Moyen terme (3 à 6 mois)</option>
                      <option value="Long terme (6 à 12 mois)">Long terme (6 à 12 mois)</option>
                      <option value="Exercice 2027">Exercice 2027</option>
                      <option value="Immédiat / Prioritaire">Immédiat / Prioritaire</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 10, fontWeight: 900, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                      Niveau de Priorité
                    </label>
                    <div style={{ display: "flex", gap: 6 }}>
                      {(["HAUTE", "MOYENNE", "BASSE"] as const).map((p) => {
                        const isPActive = newFormationPriorite === p;
                        const pColor = p === "HAUTE" ? "#DC2626" : p === "MOYENNE" ? "#D97706" : "#059669";
                        const pBg = p === "HAUTE" ? "#FEF2F2" : p === "MOYENNE" ? "#FFFBEB" : "#ECFDF5";
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setNewFormationPriorite(p)}
                            style={{
                              flex: 1,
                              padding: "6px",
                              fontSize: 11,
                              fontWeight: 800,
                              borderRadius: 0,
                              cursor: "pointer",
                              border: isPActive ? `2px solid ${pColor}` : "1px solid #CBD5E1",
                              background: isPActive ? pBg : "#FFFFFF",
                              color: isPActive ? pColor : "#64748B",
                            }}
                          >
                            {p === "HAUTE" ? "🔥 Haute" : p === "MOYENNE" ? "⚡ Moyenne" : "🌱 Basse"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 10, fontWeight: 900, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                    Objectif opérationnel visé / Compétence recherchée
                  </label>
                  <input
                    type="text"
                    value={newFormationObjectif}
                    onChange={(e) => setNewFormationObjectif(e.target.value)}
                    placeholder="ex: Renforcer l'autonomie sur les déploiements de prod et la supervision"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: 13,
                      fontWeight: 500,
                      border: "1px solid #CBD5E1",
                      background: "#FFFFFF",
                      borderRadius: 0,
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddFormationForm(false)}
                    style={{
                      padding: "8px 16px",
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      color: "#475569",
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleAddFormation}
                    disabled={isAddingFormation}
                    style={{
                      padding: "8px 20px",
                      background: "#F0822A",
                      border: "none",
                      color: "#FFFFFF",
                      fontWeight: 900,
                      fontSize: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {isAddingFormation ? "Ajout en cours..." : "✓ Ajouter au Plan de Formation"}
                  </button>
                </div>
              </div>
            )}

            {/* LISTE DES FORMATIONS EXISTANTES */}
            {formations.length === 0 ? (
              <div style={{ padding: "28px", background: "#F8FAFC", border: "1px dashed #CBD5E1", textAlign: "center" }}>
                <span style={{ fontSize: 24, display: "block", marginBottom: 6 }}>🎓</span>
                <p style={{ fontSize: 14, color: "#334155", margin: 0, fontWeight: 700 }}>
                  Aucun besoin de formation n'a été préconisé pour le moment.
                </p>
                <p style={{ fontSize: 12, color: "#64748B", margin: "4px 0 14px 0" }}>
                  Le manager N+1 peut identifier et ajouter les formations requises pour accompagner la progression du collaborateur.
                </p>
                {canEditN1 && !showAddFormationForm && (
                  <button
                    type="button"
                    onClick={() => setShowAddFormationForm(true)}
                    style={{
                      padding: "8px 18px",
                      background: "#F0822A",
                      color: "#FFFFFF",
                      border: "none",
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    + Ajouter une première formation
                  </button>
                )}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #E2E8F0" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 900, color: "#475569", textTransform: "uppercase", width: 45 }}>#</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 900, color: "#475569", textTransform: "uppercase" }}>Formation & Compétence Visée</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, fontWeight: 900, color: "#475569", textTransform: "uppercase", width: 180 }}>Échéance / Délai</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, fontWeight: 900, color: "#475569", textTransform: "uppercase", width: 120 }}>Priorité</th>
                      {canEditN1 && (
                        <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, fontWeight: 900, color: "#475569", textTransform: "uppercase", width: 80 }}>Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {formations.map((f, idx) => {
                      const pColor = f.priorite === "HAUTE" ? "#DC2626" : f.priorite === "BASSE" ? "#059669" : "#D97706";
                      const pBg = f.priorite === "HAUTE" ? "#FEF2F2" : f.priorite === "BASSE" ? "#ECFDF5" : "#FFFBEB";
                      return (
                        <tr key={f.id || idx} style={{ borderBottom: "1px solid #E2E8F0", background: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA" }}>
                          <td style={{ padding: "12px 14px", fontSize: 12, fontWeight: 800, color: "#94A3B8" }}>
                            0{idx + 1}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
                              {f.intitule}
                            </div>
                            {f.objectifVise && (
                              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2, fontWeight: 500 }}>
                                🎯 {f.objectifVise}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#334155", background: "#F1F5F9", padding: "4px 10px", borderRadius: 0, border: "1px solid #CBD5E1" }}>
                              📅 {f.delai || "À planifier"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: pColor, background: pBg, padding: "4px 10px", borderRadius: 0, border: `1px solid ${pColor}40` }}>
                              {f.priorite || "MOYENNE"}
                            </span>
                          </td>
                          {canEditN1 && (
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteFormation(f.id, idx)}
                                title="Supprimer cette formation"
                                style={{
                                  background: "#FEF2F2",
                                  border: "1px solid #FECACA",
                                  color: "#DC2626",
                                  padding: "4px 8px",
                                  cursor: "pointer",
                                  fontSize: 12,
                                  fontWeight: 800,
                                }}
                              >
                                🗑️
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECTION 4 : WORKFLOW & VISA SALARIÉ (OK / NON OK) / SIGNATURES DES 4 ACTEURS */}
          <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 0, border: "1px solid #E2E8F0" }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#F0822A", margin: "0 0 20px 0" }}>
              4. Validation, Visa Salarié & Signatures des 4 Acteurs
            </h3>

            {/* 1. BLOC RÉCAPITULATIF AUTO-ÉVALUATION DU SALARIÉ */}
            <div style={{
              marginBottom: 20,
              padding: "18px 22px",
              background: noteGlobaleSalarie > 0 ? "#F0FDF4" : "#EFF6FF",
              border: noteGlobaleSalarie > 0 ? "2px solid #10B981" : "2px solid #0284C7",
              borderRadius: 0,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 10 }}>
                <h4 style={{ fontSize: 16, fontWeight: 900, color: noteGlobaleSalarie > 0 ? "#065F46" : "#0369A1", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>✍️</span> Auto-évaluation du Salarié : <strong style={{ color: "#0284C7", fontSize: 18 }}>{noteGlobaleSalarie.toFixed(2)} / 20</strong>
                </h4>
                <span style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: noteGlobaleSalarie > 0 ? "#059669" : "#0284C7",
                  background: noteGlobaleSalarie > 0 ? "#D1FAE5" : "#E0F2FE",
                  padding: "4px 12px",
                }}>
                  {noteGlobaleSalarie > 0 ? "✓ Auto-évaluation enregistrée" : "Saisie en cours"}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#334155", margin: 0, fontWeight: 500 }}>
                {noteGlobaleSalarie > 0
                  ? `Votre auto-évaluation globale de ${noteGlobaleSalarie.toFixed(2)} / 20 est bien prise en compte et synchronisée dans la base PostgreSQL. Votre responsable N+1 doit maintenant saisir ses propres notes d'évaluation.`
                  : "Renseignez vos auto-notes et commentaires sur les objectifs ci-dessus, puis enregistrez votre auto-évaluation."}
              </p>
              {canEditSalarie && (
                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={handleSaveEvaluation}
                    disabled={isSaving}
                    style={{
                      padding: "8px 18px",
                      background: "#0284C7",
                      color: "#FFFFFF",
                      fontWeight: 900,
                      fontSize: 12,
                      border: "none",
                      cursor: "pointer",
                      borderRadius: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {isSaving ? "Enregistrement..." : "💾 Enregistrer mon Auto-Évaluation"}
                  </button>
                </div>
              )}
            </div>

            {/* 2. BLOC AVIS & VISA SALARIÉ SUR LA NOTE N+1 */}
            {(isVisaMode || isSalarie) && (
              noteGlobaleN1 > 0 ? (
                <div style={{
                  marginBottom: 24,
                  padding: 20,
                  background: visaSalarieSubmitted ? "#F0FDF4" : "#FFF7ED",
                  border: visaSalarieSubmitted ? "2px solid #10B981" : "2px solid #F0822A",
                  borderRadius: 0,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 900, color: "#000000", margin: 0 }}>
                      ✍️ Avis & Visa du Salarié sur la Note N+1 ({noteGlobaleN1.toFixed(2)}/20)
                    </h4>
                    {visaSalarieSubmitted ? (
                      <span style={{ fontSize: 11, fontWeight: 900, color: "#059669", background: "#D1FAE5", padding: "4px 10px", borderRadius: 0 }}>
                        ✓ Visa Enregistré
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 900, color: "#EA580C", background: "#FFEDD5", padding: "4px 10px", borderRadius: 0 }}>
                        ⚡ Action Requise Salarié
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 13, color: "#475569", margin: "0 0 16px 0" }}>
                    Après consultation des notes et appréciations saisies par votre responsable N+1, veuillez donner votre accord ou désaccord formel.
                  </p>

                  <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                    <button
                      onClick={() => setVisaSalarieAccord(true)}
                      disabled={visaSalarieSubmitted}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: 0,
                        border: visaSalarieAccord === true ? "2px solid #10B981" : "1px solid #CBD5E1",
                        background: visaSalarieAccord === true ? "#ECFDF5" : "#FFFFFF",
                        color: visaSalarieAccord === true ? "#047857" : "#475569",
                        fontWeight: 900,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8
                      }}
                    >
                      👍 D'accord / OK (Note & Appréciation Validées)
                    </button>

                    <button
                      onClick={() => setVisaSalarieAccord(false)}
                      disabled={visaSalarieSubmitted}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: 0,
                        border: visaSalarieAccord === false ? "2px solid #EF4444" : "1px solid #CBD5E1",
                        background: visaSalarieAccord === false ? "#FEF2F2" : "#FFFFFF",
                        color: visaSalarieAccord === false ? "#B91C1C" : "#475569",
                        fontWeight: 900,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8
                      }}
                    >
                      👎 Pas d'accord / NON OK (Motif d'observation requis)
                    </button>
                  </div>

                  <textarea
                    disabled={visaSalarieSubmitted}
                    placeholder="Remarques ou observations du salarié..."
                    value={visaSalarieObservation}
                    onChange={(e) => setVisaSalarieObservation(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      fontSize: 13,
                      borderRadius: 0,
                      border: "1px solid #CBD5E1",
                      background: "#FFFFFF",
                      marginBottom: 14,
                      outline: "none"
                    }}
                    rows={2}
                  />

                  {!visaSalarieSubmitted && (
                    <button
                      onClick={handleSubmitVisa}
                      style={{
                        padding: "10px 24px",
                        background: "#F0822A",
                        color: "#FFFFFF",
                        fontWeight: 900,
                        fontSize: 13,
                        border: "none",
                        cursor: "pointer",
                        borderRadius: 0
                      }}
                    >
                      💾 Valider mon Visa Salarié
                    </button>
                  )}
                </div>
              ) : (
                <div style={{
                  marginBottom: 24,
                  padding: 18,
                  background: "#F8FAFC",
                  border: "1px dashed #CBD5E1",
                  borderRadius: 0,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>⏳</span>
                    <div>
                      <h5 style={{ fontSize: 14, fontWeight: 800, color: "#334155", margin: 0 }}>
                        Visa Salarié : En attente de la notation par le Responsable N+1
                      </h5>
                      <p style={{ fontSize: 12, color: "#64748B", margin: "4px 0 0 0" }}>
                        La note N+1 est actuellement à <strong>0.00 / 20</strong> car votre supérieur direct n'a pas encore validé son évaluation. Vous pourrez apposer votre Visa (Accord ou Désaccord) dès que la notation N+1 sera finalisée.
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
              {/* N+1 */}
              <SignatureBox 
                step={1}
                role="Supérieur N+1"
                nom={user?.n1 ? `${user.n1.prenom} ${user.n1.nom}` : (dossier?.n1 || "N+1")}
                signe={noteGlobaleN1 > 0}
                date={noteGlobaleN1 > 0 ? "Évalué" : "En attente"}
                observation={noteGlobaleN1 > 0 ? `Notation N+1 effectuée (${noteGlobaleN1.toFixed(2)}/20)` : "En attente de l'évaluation N+1."}
              />

              {/* Salarié */}
              <SignatureBox 
                step={2}
                role="Évalué (Salarié)"
                nom={collabNom}
                signe={noteGlobaleSalarie > 0 || visaSalarieSubmitted}
                date={visaSalarieSubmitted ? "Visa accordé" : noteGlobaleSalarie > 0 ? "Auto-évaluation faite" : "En attente"}
                observation={visaSalarieSubmitted ? (visaSalarieAccord ? `✓ OK / Accord — "${visaSalarieObservation || "Vu et approuvé."}"` : `⚠️ NON OK / Désaccord — "${visaSalarieObservation}"`) : (noteGlobaleSalarie > 0 ? `Auto-évaluation effectuée (${noteGlobaleSalarie.toFixed(2)}/20)` : "Auto-évaluation en cours.")}
              />

              {/* N+2 */}
              <SignatureBox 
                step={3}
                role="Supérieur N+2"
                nom={user?.n2 ? `${user.n2.prenom} ${user.n2.nom}` : "Direction N+2"}
                signe={false}
                date="En attente"
                observation="En attente de validation N+1."
              />

              {/* DRH */}
              <SignatureBox 
                step={4}
                role="Direction RH"
                nom="Pôle RH AGILLY"
                signe={false}
                date="En attente"
                observation="Dossier en cours de revue finale par la RH."
              />
            </div>
          </div>

        </div>

        {/* ── FOOTER MODAL FLOATING ── */}
        <div style={{ padding: "20px 36px", background: "#FFFFFF", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 0,
              border: activeTab === "SALARIE" ? "4px solid #0284C7" : "4px solid #F0822A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 900,
              color: activeTab === "SALARIE" ? "#0284C7" : "#F0822A",
              background: activeTab === "SALARIE" ? "#F0F9FF" : "#FFF7ED"
            }}>
              {tauxGlobal}%
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>
                {activeTab === "SALARIE" ? "Auto-Moyenne Salarié" : "Moyenne N+1 & Taux d'atteinte"}
              </span>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#000000", margin: 0, lineHeight: 1 }}>
                {noteAffichee.toFixed(2)} / 20 <span style={{ fontSize: 15, color: activeTab === "SALARIE" ? "#0284C7" : "#F0822A", fontWeight: 800 }}>({tauxGlobal} %)</span>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={onClose}
              style={{ padding: "12px 20px", borderRadius: 0, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
            >
              Fermer
            </button>

            {/* BOUTON ENREGISTRER AUTO-ÉVALUATION OU EVALUATION N+1 */}
            {canEditSalarie ? (
              <button
                onClick={handleSaveEvaluation}
                disabled={isSaving}
                style={{
                  padding: "12px 24px",
                  borderRadius: 0,
                  border: "none",
                  background: "#0284C7",
                  color: "#FFFFFF",
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
                }}
              >
                {isSaving ? "Enregistrement en cours..." : "💾 Enregistrer mon Auto-Évaluation"}
              </button>
            ) : canEditN1 ? (
              <button
                onClick={handleSaveEvaluation}
                disabled={isSaving}
                style={{
                  padding: "12px 24px",
                  borderRadius: 0,
                  border: "none",
                  background: "#F0822A",
                  color: "#FFFFFF",
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(240, 130, 42, 0.35)",
                }}
              >
                {isSaving ? "Enregistrement en cours..." : "💾 Enregistrer l'Évaluation N+1"}
              </button>
            ) : null}

            <button
              onClick={() => {
                exportEvaluationToExcel({
                  salarie: {
                    nom: dossier?.nom || user?.nom || "KOUAME",
                    prenom: dossier?.prenom || user?.prenom || "Ebenezer Samuel",
                    poste: dossier?.poste || user?.poste || "Développeur Full-Stack",
                    direction: dossier?.direction || user?.departement || "Executive",
                    site: "Abidjan - AGILLY 1",
                  },
                  n1: {
                    nom: user?.n1?.nom || dossier?.n1 || "Marc AUBERT",
                    poste: user?.n1?.poste || "Responsable Technique",
                  },
                  objectifs: objectifs.map((o) => ({
                    intitule: o.intitule,
                    ponderation: o.ponderation,
                    criteres: {
                      t18_20: o.criteres?.find((c) => c.min === 18)?.texte || "",
                      t15_17: o.criteres?.find((c) => c.min === 15)?.texte || "",
                      t12_14: o.criteres?.find((c) => c.min === 12)?.texte || "",
                      t0_11: o.criteres?.find((c) => c.min === 0)?.texte || "",
                    },
                    noteGlobale: o.noteObtenue || undefined,
                    observation: o.commentaire || "",
                  })),
                  formations: formations.map((f) => ({
                    formation: f.intitule,
                    delai: f.delai,
                  })),
                  observationN1: noteGlobaleN1 > 0 ? `Notation N+1 effectuée. Moyenne obtenue : ${noteGlobaleN1.toFixed(2)}/20` : "",
                  observationSalarie: visaSalarieSubmitted
                    ? (visaSalarieAccord ? `Visa Salarié Accordé : ${visaSalarieObservation || "Vu et approuvé."}` : `Visa Salarié avec Réserves : ${visaSalarieObservation}`)
                    : (noteGlobaleSalarie > 0 ? `Auto-évaluation complétée. Moyenne auto-évaluée : ${noteGlobaleSalarie.toFixed(2)}/20` : ""),
                });
              }}
              style={{ padding: "12px 24px", borderRadius: 0, border: "none", background: "#107C41", color: "#FFFFFF", fontWeight: 900, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            >
              📊 Exporter la Fiche Excel (.xlsx)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function TagChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ background: "#F8FAFC", padding: "8px 14px", borderRadius: 0, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <div>
        <span style={{ fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", display: "block" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#000000" }}>{value}</span>
      </div>
    </div>
  );
}

function SignatureBox({ step, role, nom, signe, date, observation }: any) {
  return (
    <div style={{
      padding: 18,
      borderRadius: 0,
      border: "1px solid #E2E8F0",
      background: signe ? "#F8FAFC" : "#FAFAFA",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Étape 0{step}</span>
          <span style={{ fontSize: 10, fontWeight: 900, color: signe ? "#059669" : "#D97706" }}>
            {signe ? "✓ Signé / Validé" : "⏳ En attente"}
          </span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 900, color: "#F0822A", textTransform: "uppercase", marginTop: 4 }}>{role}</div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#000000", marginTop: 2 }}>{nom}</div>
      </div>
      
      <div style={{ marginTop: 14 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 800,
          color: signe ? "#059669" : "#D97706",
          background: signe ? "#D1FAE5" : "#FEF3C7",
          padding: "4px 8px",
          borderRadius: 0
        }}>
          {signe ? `✓ Validé (${date})` : "⏳ Non signé"}
        </span>
        {observation && <p style={{ fontSize: 12, color: "#475569", marginTop: 8, fontStyle: "italic" }}>"{observation}"</p>}
      </div>
    </div>
  );
}
