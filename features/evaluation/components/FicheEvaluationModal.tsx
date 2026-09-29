// ============================================================
// features/evaluation/components/FicheEvaluationModal.tsx
// Fiche d'Évaluation Officielle AGILLY — Multi-Rôles (Salarié, N+1, N+2, RH)
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { WorkflowStepper } from "@/components/shared/WorkflowStepper";
import { useAuth } from "@/contexts/AuthContext";
import { evaluationsApi } from "@/lib/api/evaluations.api";

interface FicheEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
  isAutoEvaluationMode?: boolean;
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
  role?: string;
  onSaved?: () => void;
}


interface ObjectifData {
  id: string;
  numero: number;
  intitule: string;
  ponderation: number;
  noteSalarie: number;
  commentaireSalarie: string;
  noteObtenue: number; // Note N1
  commentaire: string; // Observation N1
  noteN2?: number; // Contre-note N2
  commentaireN2?: string; // Observation N2
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
  currentStep = 4,
  dossier,
  evaluationId,
  objectifs: apiObjectifs,
  role: propRole,
  onSaved,
}: FicheEvaluationModalProps) {
  const auth = useAuth();
  const effectiveRole = (propRole || auth.role || "SALARIE").toUpperCase();

  const [objectifs, setObjectifs] = useState<ObjectifData[]>(INITIAL_OBJECTIFS);
  const [activeTab, setActiveTab] = useState<"SALARIE" | "N1" | "N2" | "RH">("SALARIE");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [fetchedEval, setFetchedEval] = useState<any | null>(null);

  // Formations préconisées par le N+1 (initialisées immédiatement depuis dossier si disponibles)
  const [formations, setFormations] = useState<Array<{
    id?: string;
    intitule: string;
    delai?: string;
    priorite?: string;
    objectifVise?: string;
    statut?: string;
  }>>(((dossier as any)?.formations as any) || []);
  const [newFormationIntitule, setNewFormationIntitule] = useState("");
  const [newFormationDelai, setNewFormationDelai] = useState("Court terme (1 à 3 mois)");
  const [newFormationPriorite, setNewFormationPriorite] = useState<"HAUTE" | "MOYENNE" | "BASSE">("MOYENNE");
  const [newFormationObjectif, setNewFormationObjectif] = useState("");
  const [isAddingFormation, setIsAddingFormation] = useState(false);
  const [showAddFormationForm, setShowAddFormationForm] = useState(false);

  // N+2 State
  const [decisionN2, setDecisionN2] = useState<"APPROUVE" | "ARBITRAGE">("APPROUVE");
  const [observationN2, setObservationN2] = useState("");

  // RH State
  const [decisionRH, setDecisionRH] = useState<"VALIDE" | "CLOTURE" | "ARBITRAGE">("VALIDE");
  const [commentaireRH, setCommentaireRH] = useState("");

  // Visa Salarié State
  const [visaSalarieAccord, setVisaSalarieAccord] = useState<boolean | null>(true);
  const [visaSalarieObservation, setVisaSalarieObservation] = useState("");
  const [visaSalarieSubmitted, setVisaSalarieSubmitted] = useState(false);

  // Identifiant de la fiche d'évaluation résolu
  const resolvedFicheId =
    evaluationId ||
    (dossier as any)?.id ||
    (dossier as any)?.ficheId ||
    (dossier as any)?.evaluationId ||
    (apiObjectifs?.[0] as any)?.ficheId ||
    fetchedEval?.id ||
    dossier?.id ||
    "";

  // Récupération automatique de la fiche complète avec formations et évaluations réelles
  useEffect(() => {
    if (isOpen) {
      if (resolvedFicheId) {
        evaluationsApi.getById(resolvedFicheId).then((data) => {
          if (data) {
            setFetchedEval(data);
            if (data.formations && Array.isArray(data.formations)) {
              setFormations(data.formations);
            }
            const hasVisaAction = (data.historique || []).some((h: any) => h.action === "VISA_SALARIE_SOUMIS" || h.action === "VISA_SALARIE");
            if (hasVisaAction || data.statut === "VALIDATION_DRH" || data.statut === "VALIDE" || data.statut === "CLOTURE") {
              setVisaSalarieSubmitted(true);
            } else {
              setVisaSalarieSubmitted(false);
            }
          }
        }).catch((err) => {
          console.error("[FicheEvaluationModal] Erreur chargement fiche:", err);
        });
      } else {
        // Fallback intelligent si l'identifiant n'a pas été transmis directement par le composant parent
        evaluationsApi.getAllForRh().then((allFiches) => {
          if (allFiches && allFiches.length > 0) {
            const targetNom = (dossier?.nom || "").toLowerCase().trim();
            const targetPrenom = (dossier?.prenom || "").toLowerCase().trim();
            const targetSalId = (dossier as any)?.salarieId || (dossier as any)?.userId;
            const match = allFiches.find((f) => {
              if (targetSalId && ((f as any).salarieId === targetSalId || f.salarie?.id === targetSalId)) return true;
              const fNom = (f.salarie?.nom || "").toLowerCase().trim();
              const fPrenom = (f.salarie?.prenom || "").toLowerCase().trim();
              if (targetNom && fNom && (fNom.includes(targetNom) || targetNom.includes(fNom))) return true;
              if (targetPrenom && fPrenom && (fPrenom.includes(targetPrenom) || targetPrenom.includes(fPrenom))) return true;
              return false;
            });
            if (match) {
              setFetchedEval(match);
              if (match.formations && Array.isArray(match.formations)) {
                setFormations(match.formations);
              }
            }
          }
        }).catch((err) => {
          console.error("[FicheEvaluationModal] Erreur fallback fiches RH:", err);
        });
      }
    } else if (!isOpen) {
      setFetchedEval(null);
      setSaveSuccessMsg(null);
    }
  }, [isOpen, resolvedFicheId, dossier?.nom, dossier?.prenom]);

  // Synchronisation des formations depuis dossier si fournies ou mises à jour
  useEffect(() => {
    if ((dossier as any)?.formations && Array.isArray((dossier as any).formations)) {
      setFormations((dossier as any).formations);
    }
  }, [(dossier as any)?.formations]);

  const effectiveObjectifs = (apiObjectifs && apiObjectifs.length > 0) ? apiObjectifs : (fetchedEval?.objectifs ?? []);
  const effectiveDossier = dossier || (fetchedEval?.salarie ? {
    id: fetchedEval.salarie.id,
    ficheId: fetchedEval.id,
    nom: fetchedEval.salarie.nom,
    prenom: fetchedEval.salarie.prenom,
    poste: fetchedEval.salarie.poste,
    direction: (fetchedEval.salarie as any)?.direction || (fetchedEval.salarie as any)?.departement,
  } : null);

  // Initialisation de l'onglet actif selon le profil connecté
  useEffect(() => {
    if (effectiveRole === "N2") {
      setActiveTab("N2");
    } else if (effectiveRole === "RH" || effectiveRole === "DRH") {
      setActiveTab("RH");
    } else if (effectiveRole === "N1") {
      setActiveTab("N1");
    } else {
      setActiveTab("SALARIE");
    }
  }, [effectiveRole, isOpen]);

  // Initialisation des objectifs avec pondération et notes
  const apiObjectifsKey = effectiveObjectifs?.map((o: any) => o.id).join(",") ?? "";

  useEffect(() => {
    if (!effectiveObjectifs || effectiveObjectifs.length === 0) {
      setObjectifs(INITIAL_OBJECTIFS);
      return;
    }

    const salarieId = effectiveDossier?.id || (effectiveDossier as any)?.salarieId || (effectiveDossier as any)?.userId || auth.user?.id;
    const count = effectiveObjectifs.length || 1;
    const defaultPond = Math.round(100 / count);

    setObjectifs(effectiveObjectifs.map((obj: any, idx: number) => {
      const evalSalarie = obj.evaluations?.find((e: any) => 
        (salarieId && e.examinateurId === salarieId) || e.type === "SALARIE"
      ) || {};

      const nonSalEvals = (obj.evaluations || []).filter((e: any) => 
        (!salarieId || e.examinateurId !== salarieId) && e.type !== "SALARIE"
      );

      const evalN1 = nonSalEvals.find((e: any) => !e.examinateurId?.includes("n2")) || nonSalEvals[0] || {};
      const evalN2 = nonSalEvals.find((e: any) => e !== evalN1) || {};

      const noteSal = obj.noteSalarie != null 
        ? Number(obj.noteSalarie) 
        : (evalSalarie.note != null ? Number(evalSalarie.note) : 0);

      const commentSal = obj.commentaireSalarie || evalSalarie.observation || "";

      const noteN1 = obj.noteObtenue != null 
        ? Number(obj.noteObtenue) 
        : (evalN1.note != null ? Number(evalN1.note) : (obj.note != null ? Number(obj.note) : 0));

      const commentN1 = obj.commentaire || evalN1.observation || "";

      const noteN2Val = obj.noteN2 != null ? Number(obj.noteN2) : (evalN2.note != null ? Number(evalN2.note) : noteN1);
      const commentN2Val = obj.commentaireN2 || evalN2.observation || "";

      const rawPond = Number(obj.ponderation);
      const finalPond = (Number.isFinite(rawPond) && rawPond > 0) ? rawPond : defaultPond;

      return {
        id: obj.id,
        numero: idx + 1,
        intitule: obj.intitule,
        ponderation: finalPond,
        noteSalarie: noteSal,
        commentaireSalarie: commentSal,
        noteObtenue: noteN1,
        commentaire: commentN1,
        noteN2: noteN2Val,
        commentaireN2: commentN2Val,
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
            texte: obj.indicateurs?.[0]?.intitule || "Validation autonome des livrables sans assistance avec dépassement des attentes."
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
            texte: obj.indicateurs?.[1]?.intitule || "Validation autonome dans le calendrier convenu et conforme au cahier des charges."
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
            texte: obj.indicateurs?.[2]?.intitule || "Validation avec légers retards ou correctifs mineurs sans impact critique."
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
            texte: obj.indicateurs?.[3]?.intitule || "Non atteinte des objectifs ou retards bloquants nécessitant encadrement."
          }
        ]
      };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiObjectifsKey, effectiveDossier?.id, auth.user?.id]);

  if (!isOpen) return null;

  // Droits de modification précis par rôle
  const canEditSalarie = activeTab === "SALARIE" && (effectiveRole === "SALARIE" || isAutoEvaluationMode || (!readOnly && effectiveRole !== "N1" && effectiveRole !== "N2" && effectiveRole !== "RH" && effectiveRole !== "DRH"));
  const canEditN1 = activeTab === "N1" && (effectiveRole === "N1" || effectiveRole === "ADMIN");
  const canEditN2 = (activeTab === "N2" || effectiveRole === "N2") && (effectiveRole === "N2" || effectiveRole === "ADMIN");
  const canEditRH = (activeTab === "RH" || effectiveRole === "RH" || effectiveRole === "DRH") && (effectiveRole === "RH" || effectiveRole === "DRH" || effectiveRole === "ADMIN");

  // Calculs pondérés des moyennes
  const totalPond = objectifs.reduce((acc, o) => acc + (Number(o.ponderation) || 0), 0);

  const noteGlobaleSalarie = totalPond > 0
    ? objectifs.reduce((acc, obj) => acc + (Number(obj.noteSalarie || 0) * (Number(obj.ponderation || 0) / 100)), 0)
    : (objectifs.length > 0 ? objectifs.reduce((acc, obj) => acc + Number(obj.noteSalarie || 0), 0) / objectifs.length : 0);

  const noteGlobaleN1 = totalPond > 0
    ? objectifs.reduce((acc, obj) => acc + (Number(obj.noteObtenue || 0) * (Number(obj.ponderation || 0) / 100)), 0)
    : (objectifs.length > 0 ? objectifs.reduce((acc, obj) => acc + Number(obj.noteObtenue || 0), 0) / objectifs.length : 0);

  const noteGlobaleN2 = totalPond > 0
    ? objectifs.reduce((acc, obj) => acc + (Number(obj.noteN2 ?? obj.noteObtenue ?? 0) * (Number(obj.ponderation || 0) / 100)), 0)
    : (objectifs.length > 0 ? objectifs.reduce((acc, obj) => acc + Number(obj.noteN2 ?? obj.noteObtenue ?? 0), 0) / objectifs.length : 0);

  const noteAffichee =
    activeTab === "SALARIE"
      ? noteGlobaleSalarie
      : activeTab === "N2"
      ? noteGlobaleN2
      : activeTab === "RH"
      ? (noteGlobaleN2 > 0 ? noteGlobaleN2 : noteGlobaleN1)
      : noteGlobaleN1;

  const tauxGlobal = ((noteAffichee / 20) * 100).toFixed(1);

  // Détection dynamique du statut et de l'étape du workflow officiel AGILLY
  const currentStatut = fetchedEval?.statut || (dossier as any)?.statut || "";
  const isFicheCloturee = currentStatut === "VALIDE" || currentStatut === "CLOTURE";

  let dynamicStep: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 = 4;
  if (isFicheCloturee) {
    dynamicStep = 8;
  } else if (currentStatut === "VALIDATION_DRH" || currentStatut === "EN_ATTENTE_RH" || currentStatut === "ARBITRAGE") {
    dynamicStep = 7;
  } else if (currentStatut === "EVALUATION_N2" || currentStatut === "VALIDATION_N2" || currentStatut === "EN_ATTENTE_N2") {
    dynamicStep = 6;
  } else if (currentStatut === "EVALUATION_N1" || currentStatut === "EN_ATTENTE_N1" || currentStatut === "VISA_SALARIE") {
    dynamicStep = 4;
  } else if (currentStatut === "AUTO_EVALUATION") {
    dynamicStep = 3;
  } else if (currentStatut === "FIXATION_OBJECTIFS") {
    dynamicStep = 2;
  } else if (currentStatut === "CREE" || currentStatut === "BROUILLON") {
    dynamicStep = 1;
  } else if (currentStep) {
    dynamicStep = currentStep;
  }


  // Gestion des notes
  const handleSelectTranche = (objId: string, critere: { tranche: string; min: number; max: number; defaultNote: number }) => {
    if (!canEditSalarie && !canEditN1) return;

    setObjectifs((prev) =>
      prev.map((o) => {
        if (o.id === objId) {
          const currentNote = activeTab === "SALARIE" ? o.noteSalarie : o.noteObtenue;
          const isNoteInTier = currentNote >= critere.min && currentNote <= critere.max;
          const newNote = isNoteInTier && currentNote > 0 ? currentNote : critere.defaultNote;

          if (activeTab === "SALARIE") {
            return { ...o, noteSalarie: newNote, trancheSelectionnee: critere.tranche };
          } else {
            return { ...o, trancheSelectionnee: critere.tranche, noteObtenue: newNote };
          }
        }
        return o;
      })
    );
  };

  const handleNoteChange = (objId: string, valStr: string) => {
    if (!canEditSalarie && !canEditN1 && !canEditN2) return;
    const val = parseFloat(valStr) || 0;
    const clampedVal = Math.min(20, Math.max(0, val));

    setObjectifs((prev) =>
      prev.map((o) => {
        if (o.id === objId) {
          const matchedCritere = o.criteres.find((c) => clampedVal >= c.min && clampedVal <= c.max) || o.criteres[o.criteres.length - 1];
          if (activeTab === "SALARIE") {
            return { ...o, noteSalarie: clampedVal, trancheSelectionnee: matchedCritere?.tranche || "" };
          } else if (activeTab === "N2") {
            return { ...o, noteN2: clampedVal };
          } else {
            return { ...o, noteObtenue: clampedVal, trancheSelectionnee: matchedCritere?.tranche || "" };
          }
        }
        return o;
      })
    );
  };

  const handleCommentaireChange = (objId: string, text: string) => {
    setObjectifs((prev) =>
      prev.map((o) => {
        if (o.id === objId) {
          if (activeTab === "SALARIE") return { ...o, commentaireSalarie: text };
          if (activeTab === "N2") return { ...o, commentaireN2: text };
          return { ...o, commentaire: text };
        }
        return o;
      })
    );
  };

  // Formations Handlers (Manager N+1)
  const handleAddFormation = async () => {
    if (!newFormationIntitule.trim()) {
      alert("Veuillez renseigner l'intitulé de la formation recommandée.");
      return;
    }

    const item = {
      id: `temp-${Date.now()}`,
      intitule: newFormationIntitule.trim(),
      delai: newFormationDelai,
      priorite: newFormationPriorite,
      objectifVise: newFormationObjectif.trim(),
      statut: "DEMANDE",
    };

    setFormations((prev) => [...prev, item]);
    setNewFormationIntitule("");
    setNewFormationObjectif("");
    setShowAddFormationForm(false);

    if (resolvedFicheId) {
      try {
        setIsAddingFormation(true);
        const res = await evaluationsApi.addFormation(resolvedFicheId, {
          intitule: item.intitule,
          delai: item.delai,
          priorite: item.priorite,
          objectifVise: item.objectifVise,
        });
        if (res?.id) {
          setFormations((prev) => prev.map((f) => (f.id === item.id ? { ...f, id: res.id } : f)));
        }
      } catch (err) {
        console.error("[FicheEvaluationModal] Erreur ajout formation:", err);
      } finally {
        setIsAddingFormation(false);
      }
    }
  };

  const handleDeleteFormation = async (formationId?: string, index?: number) => {
    if (!confirm("Voulez-vous retirer cette formation du plan de développement ?")) return;
    setFormations((prev) => prev.filter((f, idx) => (formationId ? f.id !== formationId : idx !== index)));

    if (resolvedFicheId && formationId && !formationId.startsWith("temp-")) {
      try {
        await evaluationsApi.deleteFormation(resolvedFicheId, formationId);
      } catch (err) {
        console.error("[FicheEvaluationModal] Erreur suppression formation:", err);
      }
    }
  };

  // Enregistrement Salarié ou N+1
  const handleSaveEvaluation = async () => {
    if (!resolvedFicheId) {
      alert("⚠️ Aucune fiche d'évaluation associée trouvée.");
      return;
    }
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      if (activeTab === "SALARIE") {
        await evaluationsApi.submitAutoEvaluation(resolvedFicheId, {
          notes: objectifs.map((o) => ({
            objectifId: o.id,
            note: o.noteSalarie,
            commentaire: o.commentaireSalarie,
          })),
          observations: visaSalarieObservation,
        });
        setSaveSuccessMsg("✓ Votre auto-évaluation a été enregistrée avec succès !");
        if (onSaved) onSaved();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        await evaluationsApi.submitNotesN1(resolvedFicheId, {
          evaluationCycleId: resolvedFicheId,
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
        setSaveSuccessMsg("✓ L'évaluation N+1 et le plan de formation ont été validés et transmis au N+2 !");
        if (onSaved) onSaved();
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error("[FicheEvaluationModal] Save error:", err);
      alert("Erreur lors de l'enregistrement : " + (err.message || "Erreur serveur"));
    } finally {
      setIsSaving(false);
    }
  };

  // Validation / Contre-évaluation N+2
  const handleSaveN2 = async (customDecision?: "APPROUVE" | "ARBITRAGE") => {
    if (!resolvedFicheId) {
      alert("⚠️ Aucune fiche d'évaluation trouvée pour validation N+2.");
      return;
    }
    setIsSaving(true);
    setSaveSuccessMsg(null);
    const finalDecision = customDecision || decisionN2;
    try {
      await evaluationsApi.submitNotesN2(resolvedFicheId, {
        evaluationCycleId: resolvedFicheId,
        notes: objectifs.map((o) => ({
          objectifId: o.id,
          note: o.noteN2 ?? o.noteObtenue,
          commentaire: o.commentaireN2,
        })),
        observations: observationN2 || (finalDecision === "APPROUVE" ? "Avis et visa N+2 approuvés sans réserve." : "Demande d'arbitrage hiérarchique."),
        decision: finalDecision,
      } as any);

      setSaveSuccessMsg(
        finalDecision === "ARBITRAGE"
          ? "⚠️ La demande d'arbitrage N+2 a été transmise à la Direction RH."
          : "✓ La contre-évaluation et le visa N+2 ont été validés avec succès !"
      );
      if (onSaved) onSaved();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("[FicheEvaluationModal] N2 Save error:", err);
      alert("Erreur validation N+2 : " + (err.message || "Erreur serveur"));
    } finally {
      setIsSaving(false);
    }
  };

  // Validation Finale / Clôture RH
  const handleValiderRH = async (targetStatut: "VALIDE" | "CLOTURE" | "ARBITRAGE") => {
    if (!resolvedFicheId) {
      alert("⚠️ Aucune fiche d'évaluation trouvée pour validation RH.");
      return;
    }
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      await evaluationsApi.validerParRh(resolvedFicheId, {
        statut: targetStatut,
        commentaire: commentaireRH || (targetStatut === "ARBITRAGE" ? "Dossier ouvert en arbitrage RH." : "Validation finale et approbation RH effectuée."),
        noteFinale: Number(noteAffichee.toFixed(2)),
      });

      setFetchedEval((prev: any) => prev ? { ...prev, statut: targetStatut } : { statut: targetStatut });

      setSaveSuccessMsg(
        targetStatut === "ARBITRAGE"
          ? "⚠️ Le dossier a été placé en arbitrage par la Direction RH."
          : "✓ La fiche d'évaluation a été validée et clôturée définitivement par la Direction RH !"
      );
      if (onSaved) onSaved();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("[FicheEvaluationModal] RH Save error:", err);
      alert("Erreur validation RH : " + (err.message || "Erreur serveur"));
    } finally {
      setIsSaving(false);
    }
  };

  // Signature Visa Salarié
  const handleSubmitVisa = async () => {
    if (visaSalarieAccord === null) {
      alert("Veuillez sélectionner soit 'Accord (OK)', soit 'Désaccord (NON OK)'.");
      return;
    }
    if (!resolvedFicheId) {
      alert("⚠️ Aucune fiche d'évaluation trouvée pour apposer votre visa.");
      return;
    }
    try {
      await evaluationsApi.submitVisaSalarie(resolvedFicheId, {
        accord: visaSalarieAccord,
        observation: visaSalarieObservation || (visaSalarieAccord ? "Accord du salarié sur l'évaluation N+1" : "Désaccord du salarié sur l'évaluation N+1"),
      });
      setVisaSalarieSubmitted(true);
      setSaveSuccessMsg("✓ Votre Visa a été transmis au supérieur N+2 et à la DRH !");
      if (onSaved) onSaved();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("[FicheEvaluationModal] Sign error:", err);
      alert("Erreur lors de la signature : " + (err.message || "Erreur serveur"));
    }
  };

  const collabNom = effectiveDossier ? `${effectiveDossier.prenom || ""} ${effectiveDossier.nom}`.trim() : (auth.user ? `${auth.user.prenom || ""} ${auth.user.nom}`.trim() : "Collaborateur Agilly");
  const collabInitials = effectiveDossier ? `${(effectiveDossier.prenom || "A").charAt(0)}${(effectiveDossier.nom || "G").charAt(0)}` : "AG";
  const collabPoste = effectiveDossier ? `${effectiveDossier.poste}${effectiveDossier.direction ? ` · ${effectiveDossier.direction}` : ""}` : (auth.user ? `${auth.user.poste || "Collaborateur"} · ${auth.user.departement || "Direction Technique"}` : "Collaborateur Agilly");

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(15, 23, 42, 0.65)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        background: "#FFFFFF",
        width: "100%",
        maxWidth: 1080,
        maxHeight: "94vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.18)",
      }}>

        {/* ── TOP ACCENT BRAND BAR ── */}
        <div style={{
          height: 4,
          width: "100%",
          background:
            activeTab === "SALARIE"
              ? "#0284C7"
              : activeTab === "N2"
              ? "#9333EA"
              : activeTab === "RH"
              ? "#059669"
              : "#F0822A"
        }} />

        {/* ── HEADER MODAL ── */}
        <div style={{
          padding: "14px 24px",
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              background: "#FFF7ED",
              border: "1px solid #FFEDD5",
              color: "#F0822A",
              fontWeight: 800,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              A
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  Fiche d'Évaluation de Performance Officielle
                </h2>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#059669", background: "#ECFDF5", padding: "2px 8px", border: "1px solid #A7F3D0" }}>
                  Campagne 2026
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#64748B", margin: "1px 0 0 0", fontWeight: 500 }}>
                AGILLY RHEVAL · {collabNom} · {collabPoste}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              color: "#64748B",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >✕</button>
        </div>

        {/* ── BANNIÈRE SUCCÈS ── */}
        {saveSuccessMsg && (
          <div style={{
            padding: "10px 24px",
            background: "#ECFDF5",
            borderBottom: "1px solid #10B981",
            color: "#065F46",
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span>{saveSuccessMsg}</span>
            <button onClick={() => setSaveSuccessMsg(null)} style={{ background: "none", border: "none", color: "#065F46", cursor: "pointer", fontWeight: 800 }}>✕</button>
          </div>
        )}

        {/* ── NAVIGATION DES 4 RÔLES / ONGLETS DU CYCLE ── */}
        <div style={{
          padding: "8px 24px",
          background: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          flexShrink: 0
        }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTab("SALARIE")}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                border: activeTab === "SALARIE" ? "2px solid #0284C7" : "1px solid #CBD5E1",
                background: activeTab === "SALARIE" ? "#F0F9FF" : "#FFFFFF",
                color: activeTab === "SALARIE" ? "#0284C7" : "#475569",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              ✍️ Auto-Évaluation ({noteGlobaleSalarie.toFixed(2)}/20)
            </button>

            <button
              onClick={() => setActiveTab("N1")}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                border: activeTab === "N1" ? "2px solid #F0822A" : "1px solid #CBD5E1",
                background: activeTab === "N1" ? "#FFF7ED" : "#FFFFFF",
                color: activeTab === "N1" ? "#F0822A" : "#475569",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              📋 Évaluation N+1 & Formations ({noteGlobaleN1.toFixed(2)}/20)
            </button>

            <button
              onClick={() => setActiveTab("N2")}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                border: activeTab === "N2" ? "2px solid #9333EA" : "1px solid #CBD5E1",
                background: activeTab === "N2" ? "#FAF5FF" : "#FFFFFF",
                color: activeTab === "N2" ? "#9333EA" : "#475569",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              ⚖️ Évaluation N+2 ({noteGlobaleN2.toFixed(2)}/20)
            </button>

            <button
              onClick={() => setActiveTab("RH")}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                border: activeTab === "RH" ? "2px solid #059669" : "1px solid #CBD5E1",
                background: activeTab === "RH" ? "#ECFDF5" : "#FFFFFF",
                color: activeTab === "RH" ? "#059669" : "#475569",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              🏢 Décision Finale RH
            </button>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>
            Connecté en tant que : <strong style={{ color: "#0F172A" }}>{effectiveRole}</strong>
          </div>
        </div>

        {/* ── BODY SCROLLABLE ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20, background: "#F7F8FA" }}>
          
          <WorkflowStepper currentStep={dynamicStep} isCompleted={isFicheCloturee} />

          {/* SECTION 1 : COLLABORATEUR HERO */}
          <div style={{ background: "#FFFFFF", padding: 18, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  background: activeTab === "SALARIE" ? "#0284C7" : activeTab === "N2" ? "#9333EA" : activeTab === "RH" ? "#059669" : "#F0822A",
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {collabInitials}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    {collabNom}
                  </h3>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "#64748B", margin: "2px 0 0 0" }}>
                    {collabPoste}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <TagChip icon="📍" label="Direction" value={effectiveDossier?.direction || "Technique"} />
                <TagChip icon="👨‍💼" label="Manager N+1" value={(effectiveDossier as any)?.n1 || "Marc AUBERT"} />
                <TagChip icon="📅" label="Statut Fiche" value={currentStatut || "EN_COURS"} />
              </div>
            </div>

            {/* Comparatif synthétique des notes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, background: "#F8FAFC", padding: 12, border: "1px solid #E2E8F0" }}>
              <div style={{ textAlign: "center", borderRight: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#0284C7", textTransform: "uppercase", display: "block" }}>1. Auto-Note Salarié</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: "#0369A1" }}>{noteGlobaleSalarie.toFixed(2)} / 20</span>
              </div>
              <div style={{ textAlign: "center", borderRight: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#EA580C", textTransform: "uppercase", display: "block" }}>2. Note Manager N+1</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: "#F0822A" }}>{noteGlobaleN1.toFixed(2)} / 20</span>
              </div>
              <div style={{ textAlign: "center", borderRight: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#9333EA", textTransform: "uppercase", display: "block" }}>3. Contre-Note N+2</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: "#9333EA" }}>{noteGlobaleN2.toFixed(2)} / 20</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#059669", textTransform: "uppercase", display: "block" }}>4. Formations à Prévoir</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: "#059669" }}>{formations.length} module(s)</span>
              </div>
            </div>
          </div>

          {/* SECTION 2 : GRILLE DES OBJECTIFS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  2. Grille des Objectifs & Barème de Notation — Vue {activeTab}
                </h3>
                <p style={{ fontSize: 11, color: "#64748B", margin: "2px 0 0 0" }}>
                  {activeTab === "SALARIE"
                    ? "Renseignez votre auto-évaluation sur chaque objectif opérationnel"
                    : activeTab === "N1"
                    ? "Attribuez les notes de performance N+1 par tranche ou valeur directe"
                    : activeTab === "N2"
                    ? "Examinez les notes du N+1 et ajustez la contre-évaluation N+2 si nécessaire"
                    : "Supervision finale DRH des écarts et moyennes consolidées"}
                </p>
              </div>

              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", background: "#FFFFFF", padding: "4px 10px", border: "1px solid #CBD5E1" }}>
                {objectifs.length} Objectif(s) · {objectifs.reduce((s, o) => s + (o.ponderation ?? 0), 0)}%
              </span>
            </div>

            {objectifs.map((obj) => {
              const currentNote =
                activeTab === "SALARIE"
                  ? obj.noteSalarie
                  : activeTab === "N2"
                  ? (obj.noteN2 ?? obj.noteObtenue)
                  : obj.noteObtenue;

              return (
                <div key={obj.id} style={{ background: "#FFFFFF", padding: 20, border: "1px solid #E2E8F0" }}>
                  {/* Objectif Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#F0822A", background: "#FFF7ED", padding: "2px 8px", border: "1px solid #FFEDD5" }}>
                          OBJECTIF 0{obj.numero}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>
                          Pondération : <strong style={{ color: "#F0822A" }}>{obj.ponderation}%</strong>
                        </span>
                      </div>
                      <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: 0 }}>
                        {obj.intitule}
                      </h4>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <div style={{ background: "#F0F9FF", padding: "4px 10px", border: "1px solid #BAE6FD", textAlign: "right" }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: "#0284C7", textTransform: "uppercase", display: "block" }}>Auto-Note</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: "#0369A1" }}>{obj.noteSalarie} / 20</span>
                      </div>
                      <div style={{ background: "#FFF7ED", padding: "4px 10px", border: "1px solid #FFEDD5", textAlign: "right" }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: "#EA580C", textTransform: "uppercase", display: "block" }}>Note N+1</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: "#F0822A" }}>{obj.noteObtenue} / 20</span>
                      </div>
                      {(activeTab === "N2" || activeTab === "RH") && (
                        <div style={{ background: "#FAF5FF", padding: "4px 10px", border: "1px solid #E9D5FF", textAlign: "right" }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: "#9333EA", textTransform: "uppercase", display: "block" }}>Note N+2</span>
                          <span style={{ fontSize: 13, fontWeight: 900, color: "#9333EA" }}>{obj.noteN2 ?? obj.noteObtenue} / 20</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tranches d'atteinte cliquables */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                    {obj.criteres.map((c, i) => {
                      const isSelected = currentNote >= c.min && currentNote <= c.max && currentNote > 0;
                      return (
                        <div
                          key={i}
                          onClick={() => handleSelectTranche(obj.id, c)}
                          style={{
                            padding: "8px 12px",
                            border: isSelected ? `2px solid ${c.color}` : "1px solid #E2E8F0",
                            background: isSelected ? c.bg : "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            cursor: (canEditSalarie || canEditN1) ? "pointer" : "default",
                          }}
                        >
                          <span style={{
                            padding: "2px 8px",
                            fontSize: 10,
                            fontWeight: 800,
                            background: isSelected ? c.color : "#F1F5F9",
                            color: isSelected ? "#FFFFFF" : "#475569",
                            minWidth: 70,
                            textAlign: "center"
                          }}>
                            {c.tranche}
                          </span>
                          <span style={{ fontSize: 12, color: isSelected ? "#0F172A" : "#64748B", fontWeight: isSelected ? 700 : 500, flex: 1 }}>
                            {c.texte}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Saisie note et appréciation */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, background: "#F8FAFC", padding: 12, border: "1px solid #E2E8F0" }}>
                    <div style={{ width: 140, flexShrink: 0 }}>
                      <label style={{ fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                        Ajuster Note / 20
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        disabled={!canEditSalarie && !canEditN1 && !canEditN2}
                        value={currentNote}
                        onChange={(e) => handleNoteChange(obj.id, e.target.value)}
                        style={{
                          width: 80,
                          height: 32,
                          textAlign: "center",
                          fontSize: 13,
                          fontWeight: 800,
                          border: "1px solid #CBD5E1",
                          background: "#FFFFFF",
                        }}
                      />
                    </div>

                    {/* Commentaire uniquement pour N+1 et N+2 — le salarié note seulement */}
                    {activeTab !== "SALARIE" && (
                      <div style={{ flex: 1, minWidth: 240 }}>
                        <label style={{ fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                          Commentaire {activeTab === "N2" ? "N+2" : "N+1"}
                        </label>
                        <input
                          type="text"
                          disabled={!canEditN1 && !canEditN2}
                          value={activeTab === "N2" ? (obj.commentaireN2 || "") : obj.commentaire}
                          onChange={(e) => handleCommentaireChange(obj.id, e.target.value)}
                          placeholder="Commentaires, justifications opérationnelles..."
                          style={{
                            width: "100%",
                            height: 32,
                            padding: "0 10px",
                            fontSize: 12,
                            border: "1px solid #CBD5E1",
                            background: "#FFFFFF",
                          }}
                        />
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* SECTION 3 : FORMATIONS RECOMMANDÉES (VISIBLE PAR TOUS) */}
          <div style={{ background: "#FFFFFF", padding: 20, border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  3. Formations à envisager & Plan de développement
                </h3>
                <p style={{ fontSize: 11, color: "#64748B", margin: "2px 0 0 0" }}>
                  Besoins en compétences identifiés par le responsable N+1 pour accompagner les objectifs futurs
                </p>
              </div>

              {canEditN1 && !showAddFormationForm && (
                <button
                  type="button"
                  onClick={() => setShowAddFormationForm(true)}
                  style={{
                    padding: "6px 12px",
                    background: "#F0822A",
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  + Ajouter un besoin en formation
                </button>
              )}
            </div>

            {/* Formulaire d'ajout N+1 */}
            {canEditN1 && showAddFormationForm && (
              <div style={{ background: "#FFF7ED", padding: 14, border: "1px solid #FFEDD5", marginBottom: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#EA580C" }}>Nouvelle préconisation de formation</span>
                <input
                  type="text"
                  value={newFormationIntitule}
                  onChange={(e) => setNewFormationIntitule(e.target.value)}
                  placeholder="Intitulé de la formation (ex : Architecture Cloud Azure, Leadership...)"
                  style={{ width: "100%", height: 32, padding: "0 10px", fontSize: 12, border: "1px solid #CBD5E1", background: "#FFFFFF" }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <select
                    value={newFormationDelai}
                    onChange={(e) => setNewFormationDelai(e.target.value)}
                    style={{ height: 32, fontSize: 12, border: "1px solid #CBD5E1", background: "#FFFFFF", padding: "0 8px" }}
                  >
                    <option value="Court terme (1 à 3 mois)">Court terme (1 à 3 mois)</option>
                    <option value="Moyen terme (3 à 6 mois)">Moyen terme (3 à 6 mois)</option>
                    <option value="Long terme (6 à 12 mois)">Long terme (6 à 12 mois)</option>
                    <option value="Exercice 2027">Exercice 2027</option>
                  </select>
                  <select
                    value={newFormationPriorite}
                    onChange={(e) => setNewFormationPriorite(e.target.value as any)}
                    style={{ height: 32, fontSize: 12, border: "1px solid #CBD5E1", background: "#FFFFFF", padding: "0 8px" }}
                  >
                    <option value="HAUTE">Priorité Haute</option>
                    <option value="MOYENNE">Priorité Moyenne</option>
                    <option value="BASSE">Priorité Basse</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={newFormationObjectif}
                  onChange={(e) => setNewFormationObjectif(e.target.value)}
                  placeholder="Objectif opérationnel visé..."
                  style={{ width: "100%", height: 32, padding: "0 10px", fontSize: 12, border: "1px solid #CBD5E1", background: "#FFFFFF" }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddFormationForm(false)}
                    style={{ padding: "6px 12px", background: "#FFFFFF", border: "1px solid #CBD5E1", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleAddFormation}
                    disabled={isAddingFormation}
                    style={{ padding: "6px 14px", background: "#F0822A", border: "none", color: "#FFFFFF", fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                  >
                    {isAddingFormation ? "Ajout..." : "Ajouter la formation"}
                  </button>
                </div>
              </div>
            )}

            {/* TABLEAU DES FORMATIONS */}
            {formations.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #E2E8F0" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase", width: 40 }}>#</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Formation</th>
                      <th style={{ padding: "8px 12px", textAlign: "center", fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase", width: 160 }}>Délai</th>
                      <th style={{ padding: "8px 12px", textAlign: "center", fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase", width: 100 }}>Priorité</th>
                      {canEditN1 && (
                        <th style={{ padding: "8px 12px", textAlign: "center", fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase", width: 60 }}>Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {formations.map((f, idx) => (
                      <tr key={f.id || idx} style={{ borderBottom: "1px solid #E2E8F0" }}>
                        <td style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>0{idx + 1}</td>
                        <td style={{ padding: "8px 12px" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", display: "block" }}>{f.intitule}</span>
                          {f.objectifVise && <span style={{ fontSize: 10, color: "#64748B" }}>🎯 {f.objectifVise}</span>}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center", fontSize: 11, color: "#475569" }}>{f.delai || "Non précisé"}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: "2px 6px",
                            background: f.priorite === "HAUTE" ? "#FEF2F2" : f.priorite === "BASSE" ? "#ECFDF5" : "#FFFBEB",
                            color: f.priorite === "HAUTE" ? "#DC2626" : f.priorite === "BASSE" ? "#059669" : "#D97706",
                            border: "1px solid rgba(0,0,0,0.06)",
                          }}>
                            {f.priorite || "MOYENNE"}
                          </span>
                        </td>
                        {canEditN1 && (
                          <td style={{ padding: "8px 12px", textAlign: "center" }}>
                            <button
                              onClick={() => handleDeleteFormation(f.id, idx)}
                              style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 14 }}
                              title="Supprimer"
                            >
                              ✕
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "16px", background: "#F8FAFC", border: "1px dashed #CBD5E1", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
                  Aucune formation n'a encore été ajoutée par le manager N+1 pour ce collaborateur.
                </p>
              </div>
            )}
          </div>

          {/* SECTION 4 : CONTRE-ÉVALUATION N+2 (VOLET DÉDIÉ N2) */}
          {activeTab === "N2" && (
            <div style={{ background: "#FAF5FF", padding: 20, border: "2px solid #9333EA" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 900, color: "#6B21A8", margin: 0 }}>
                  ⚖️ Décision & Visa du Supérieur Hiérarchique N+2
                </h3>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#9333EA", background: "#F3E8FF", padding: "3px 8px" }}>
                  Moyenne N+2 : {noteGlobaleN2.toFixed(2)}/20
                </span>
              </div>

              <p style={{ fontSize: 12, color: "#581C87", margin: "0 0 12px 0" }}>
                En tant que Supérieur N+2, vous supervisez l'évaluation faite par le manager N+1 et le visa du salarié.
              </p>

              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => setDecisionN2("APPROUVE")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: decisionN2 === "APPROUVE" ? "2px solid #059669" : "1px solid #CBD5E1",
                    background: decisionN2 === "APPROUVE" ? "#ECFDF5" : "#FFFFFF",
                    color: decisionN2 === "APPROUVE" ? "#065F46" : "#475569",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ✓ Approbation & Accord N+2
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionN2("ARBITRAGE")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: decisionN2 === "ARBITRAGE" ? "2px solid #DC2626" : "1px solid #CBD5E1",
                    background: decisionN2 === "ARBITRAGE" ? "#FEF2F2" : "#FFFFFF",
                    color: decisionN2 === "ARBITRAGE" ? "#991B1B" : "#475569",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ⚠️ Demande d'Arbitrage (Écart ou Réserve)
                </button>
              </div>

              <textarea
                value={observationN2}
                onChange={(e) => setObservationN2(e.target.value)}
                placeholder="Motivations, appréciations ou réserves du supérieur N+2..."
                style={{ width: "100%", height: 64, padding: "8px 10px", fontSize: 12, border: "1px solid #CBD5E1", background: "#FFFFFF", marginBottom: 12 }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => handleSaveN2()}
                  disabled={isSaving}
                  style={{
                    padding: "8px 18px",
                    background: "#9333EA",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {isSaving ? "Enregistrement..." : "✅ Valider la Contre-Évaluation N+2"}
                </button>
              </div>
            </div>
          )}

          {/* SECTION 5 : DÉCISION & CLÔTURE DRH (VOLET DÉDIÉ RH) */}
          {activeTab === "RH" && (
            <div style={{ background: "#ECFDF5", padding: 20, border: "2px solid #059669" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 900, color: "#065F46", margin: 0 }}>
                  🏢 Décision Finale & Validation de la Direction RH
                </h3>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", background: "#D1FAE5", padding: "3px 8px" }}>
                  Moyenne Finale : {noteAffichee.toFixed(2)}/20
                </span>
              </div>

              <p style={{ fontSize: 12, color: "#047857", margin: "0 0 12px 0" }}>
                La Direction RH entérine l'évaluation définitive, valide les bonus associés et inscrit les formations au catalogue officiel.
              </p>

              {isFicheCloturee ? (
                <div style={{ background: "#ECFDF5", border: "1px solid #10B981", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, background: "#059669", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>
                      ✓
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#065F46" }}>
                        Fiche d'Évaluation Validée et Clôturée Définitivement
                      </h4>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#047857" }}>
                        La Direction RH a validé l'évaluation. La note officielle retenue est de <strong>{noteAffichee.toFixed(2)} / 20 ({tauxGlobal}%)</strong>.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, background: "#FFFFFF", padding: 12, border: "1px solid #D1FAE5", flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase" }}>Statut Actuel</span>
                      <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 800, color: "#059669" }}>{currentStatut}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase" }}>Étape Workflow</span>
                      <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 800, color: "#0F172A" }}>8 / 8 — Clôturé Définitivement</p>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase" }}>Export Officiel</span>
                      <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 800, color: "#0284C7" }}>Excel Conforme Disponible</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <button
                      type="button"
                      onClick={() => setDecisionRH("VALIDE")}
                      style={{
                        flex: 1,
                        padding: "8px",
                        border: decisionRH === "VALIDE" ? "2px solid #059669" : "1px solid #CBD5E1",
                        background: decisionRH === "VALIDE" ? "#D1FAE5" : "#FFFFFF",
                        color: "#065F46",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ✅ Valider Définitivement (Dossier Conforme)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionRH("CLOTURE")}
                      style={{
                        flex: 1,
                        padding: "8px",
                        border: decisionRH === "CLOTURE" ? "2px solid #0284C7" : "1px solid #CBD5E1",
                        background: decisionRH === "CLOTURE" ? "#E0F2FE" : "#FFFFFF",
                        color: "#0369A1",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      🔒 Clôturer la Fiche (Campagne Terminée)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionRH("ARBITRAGE")}
                      style={{
                        flex: 1,
                        padding: "8px",
                        border: decisionRH === "ARBITRAGE" ? "2px solid #DC2626" : "1px solid #CBD5E1",
                        background: decisionRH === "ARBITRAGE" ? "#FEE2E2" : "#FFFFFF",
                        color: "#991B1B",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ⚖️ Ouvrir un Arbitrage RH
                    </button>
                  </div>

                  <textarea
                    value={commentaireRH}
                    onChange={(e) => setCommentaireRH(e.target.value)}
                    placeholder="Décisions RH, validation de la prime ou motifs d'arbitrage..."
                    style={{ width: "100%", height: 64, padding: "8px 10px", fontSize: 12, border: "1px solid #CBD5E1", background: "#FFFFFF", marginBottom: 12 }}
                  />

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => handleValiderRH(decisionRH)}
                      disabled={isSaving}
                      style={{
                        padding: "8px 18px",
                        background: decisionRH === "ARBITRAGE" ? "#DC2626" : "#059669",
                        color: "#FFFFFF",
                        border: "none",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {isSaving ? "Traitement..." : decisionRH === "ARBITRAGE" ? "⚖️ Placer en Arbitrage RH" : "✅ Enregistrer la Décision RH"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}



        </div>


        {/* ── FOOTER ACTIONS MODAL ── */}
        <div style={{
          padding: "14px 24px",
          background: "#FFFFFF",
          borderTop: "1px solid #E2E8F0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              border: `2px solid ${activeTab === "SALARIE" ? "#0284C7" : activeTab === "N2" ? "#9333EA" : activeTab === "RH" ? "#059669" : "#F0822A"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
              color: "#0F172A",
            }}>
              {tauxGlobal}%
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Moyenne {activeTab}
              </span>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: 0 }}>
                {noteAffichee.toFixed(2)} / 20 <span style={{ fontSize: 12, color: "#64748B" }}>({tauxGlobal} %)</span>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={onClose}
              style={{ padding: "8px 14px", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
            >
              Fermer
            </button>

            {/* BOUTON SELON LE RÔLE ACTUEL */}
            {canEditSalarie ? (
              <button
                onClick={handleSaveEvaluation}
                disabled={isSaving}
                style={{ padding: "8px 16px", background: "#0284C7", color: "#FFFFFF", border: "none", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
              >
                {isSaving ? "Enregistrement..." : "💾 Enregistrer mon Auto-Évaluation"}
              </button>
            ) : canEditN1 ? (
              <button
                onClick={handleSaveEvaluation}
                disabled={isSaving}
                style={{ padding: "8px 16px", background: "#F0822A", color: "#FFFFFF", border: "none", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
              >
                {isSaving ? "Enregistrement..." : "💾 Enregistrer l'Évaluation N+1"}
              </button>
            ) : canEditN2 ? (
              <button
                onClick={() => handleSaveN2()}
                disabled={isSaving}
                style={{ padding: "8px 16px", background: "#9333EA", color: "#FFFFFF", border: "none", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
              >
                {isSaving ? "Enregistrement..." : "✅ Valider Contre-Évaluation N+2"}
              </button>
            ) : canEditRH ? (
              isFicheCloturee ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#ECFDF5", border: "1px solid #10B981", color: "#065F46", fontWeight: 800, fontSize: 12 }}>
                  <span>✓</span> Dossier Déjà Validé & Clôturé (RH)
                </div>
              ) : (
                <button
                  onClick={() => handleValiderRH(decisionRH)}
                  disabled={isSaving}
                  style={{ padding: "8px 16px", background: "#059669", color: "#FFFFFF", border: "none", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
                >
                  {isSaving ? "Enregistrement..." : "✅ Valider & Clôturer la Fiche (RH)"}
                </button>
              )
            ) : null}

            {/* EXPORT EXCEL — disponible pour tous les acteurs */}
            <button
              onClick={() => {
                import("@/lib/utils/exportExcelEvaluation").then(({ exportEvaluationToExcel }) => {
                  exportEvaluationToExcel({
                    salarie: {
                      nom: effectiveDossier?.nom || auth.user?.nom || "KOUAME",
                      prenom: effectiveDossier?.prenom || auth.user?.prenom || "Ebenezer Samuel",
                      poste: effectiveDossier?.poste || auth.user?.poste || "Collaborateur",
                      direction: effectiveDossier?.direction || auth.user?.departement || "Direction",
                      site: "Abidjan - AGILLY 1",
                    },
                    n1: {
                      nom: auth.user?.n1?.nom || (effectiveDossier as any)?.n1 || "Manager N+1",
                      poste: auth.user?.n1?.poste || "Responsable",
                    },
                    objectifs: objectifs.map((o) => ({
                      intitule: o.intitule,
                      ponderation: o.ponderation,
                      criteres: {
                        t18_20: o.criteres?.find((c: any) => c.min === 18)?.texte || "",
                        t15_17: o.criteres?.find((c: any) => c.min === 15)?.texte || "",
                        t12_14: o.criteres?.find((c: any) => c.min === 12)?.texte || "",
                        t0_11:  o.criteres?.find((c: any) => c.min === 0)?.texte || "",
                      },
                      noteGlobale: o.noteObtenue || undefined,
                      observation: o.commentaire || "",
                    })),
                    formations: formations.map((f) => ({
                      formation: f.intitule,
                      delai: f.delai,
                    })),
                    observationN1: noteGlobaleN1 > 0 ? `Note N+1 : ${noteGlobaleN1.toFixed(2)}/20` : "",
                    observationSalarie: noteGlobaleSalarie > 0 ? `Auto-évaluation : ${noteGlobaleSalarie.toFixed(2)}/20` : "",
                  });
                });
              }}
              style={{ padding: "8px 14px", border: "none", background: "#107C41", color: "#FFFFFF", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              📊 Exporter Excel (.xlsx)
            </button>
          </div>
        </div>



      </div>
    </div>
  );
}

function TagChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ background: "#F8FAFC", padding: "4px 8px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 11 }}>{icon}</span>
      <div>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", display: "block" }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#0F172A" }}>{value}</span>
      </div>
    </div>
  );
}

function SignatureBox({ step, role, nom, signe, date, observation }: any) {
  return (
    <div style={{
      padding: 10,
      border: "1px solid #E2E8F0",
      background: signe ? "#F8FAFC" : "#FAFAFA",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Étape 0{step}</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: signe ? "#059669" : "#D97706" }}>
            {signe ? "✓ Validé" : "⏳ En attente"}
          </span>
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#F0822A", textTransform: "uppercase", marginTop: 2 }}>{role}</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", marginTop: 1 }}>{nom}</div>
      </div>
      
      <div style={{ marginTop: 8 }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: signe ? "#059669" : "#D97706",
          background: signe ? "#D1FAE5" : "#FEF3C7",
          padding: "2px 6px",
          display: "inline-block"
        }}>
          {signe ? `✓ ${date}` : "⏳ Non signé"}
        </span>
        {observation && <p style={{ fontSize: 10, color: "#64748B", margin: "4px 0 0 0", fontStyle: "italic" }}>"{observation}"</p>}
      </div>
    </div>
  );
}
