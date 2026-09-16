// ============================================================
// features/evaluation/components/FicheEvaluation360ManagerModal.tsx
// Grille d'Évaluation 360° 2026 — Managers & Chefs d'Équipe (AGILLY RHEVAL)
// ============================================================

"use client";
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { export360ToExcel } from "@/lib/utils/exportExcel360";

interface FicheEvaluation360ManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
  managerData?: {
    nomPrenoms: string;
    fonction: string;
    dateEmbauche: string;
    service: string;
  };
}

interface Critere360 {
  id: string;
  domaine: string;
  comportement: string;
  note: number; // /5
}

interface DomaineGroup {
  titre: string;
  criteres: Critere360[];
}

const INITIAL_DOMAINES: DomaineGroup[] = [
  {
    titre: "Leadership et vision",
    criteres: [
      {
        id: "lead-1",
        domaine: "Leadership et vision",
        comportement: "Est capable d'aligner ses missions sur le plan stratégique de l'entreprise",
        note: 4,
      },
      {
        id: "lead-2",
        domaine: "Leadership et vision",
        comportement: "Sait motiver, mobiliser et donner envie d'atteindre les objectifs fixés.",
        note: 4.5,
      },
      {
        id: "lead-3",
        domaine: "Leadership et vision",
        comportement: "Sait guider son équipe dans des contextes d'incertitude ou de transformation",
        note: 4,
      },
    ],
  },
  {
    titre: "Développement des talents des collaborateurs",
    criteres: [
      {
        id: "dev-1",
        domaine: "Développement des talents des collaborateurs",
        comportement: "Consacre du temps à la formation, au coaching et au développement des compétences de ses collaborateurs",
        note: 3.5,
      },
      {
        id: "dev-2",
        domaine: "Développement des talents des collaborateurs",
        comportement: "Fait des retours positifs ou constructifs fréquents sur le travail accompli par ses collaborateurs",
        note: 4,
      },
      {
        id: "dev-3",
        domaine: "Développement des talents des collaborateurs",
        comportement: "Fait confiance, délègue efficacement et favorise l'initiative",
        note: 4.5,
      },
    ],
  },
  {
    titre: "Pilotage et prise de décision",
    criteres: [
      {
        id: "pil-1",
        domaine: "Pilotage et prise de décision",
        comportement: "Sait trancher dans des délais raisonnables et assumer ses choix.",
        note: 3,
      },
      {
        id: "pil-2",
        domaine: "Pilotage et prise de décision",
        comportement: "Est capable d'anticiper les difficultés et d'ajuster les priorités si nécessaire.",
        note: 4,
      },
      {
        id: "pil-3",
        domaine: "Pilotage et prise de décision",
        comportement: "Sait être efficace dans la résolution de problèmes et la gestion des imprévus",
        note: 3.5,
      },
    ],
  },
  {
    titre: "Intelligence émotionnelle et savoir-être",
    criteres: [
      {
        id: "emo-1",
        domaine: "Intelligence émotionnelle et savoir-être",
        comportement: "Sait garder son calme et préserver un climat serein sous la pression",
        note: 4,
      },
      {
        id: "emo-2",
        domaine: "Intelligence émotionnelle et savoir-être",
        comportement: "Sait détecter les tensions et les désamorcer avec diplomatie",
        note: 4.5,
      },
    ],
  },
];

export function FicheEvaluation360ManagerModal({
  isOpen,
  onClose,
  readOnly = false,
  managerData = {
    nomPrenoms: "Sevan AKOUMIA",
    fonction: "Directeur des Opérations & Tech Lead",
    dateEmbauche: "15 janvier 2021",
    service: "Direction Technique & Projets",
  },
}: FicheEvaluation360ManagerModalProps) {
  const { user } = useAuth();
  
  // Vérification de sécurité : Le salarié ne doit pas voir les sections en Orange (Comité Restreint)
  const isSalarie = user?.role === "SALARIE";

  const [domaines, setDomaines] = useState<DomaineGroup[]>(INITIAL_DOMAINES);
  const [formations, setFormations] = useState([
    { id: "f1", intitule: "Management Agile & Leadership du Changement", delai: "Q2 2026" },
    { id: "f2", intitule: "Communication non-violente et gestion de conflits d'équipe", delai: "Q3 2026" },
  ]);
  const [newFormationIntitule, setNewFormationIntitule] = useState("");
  const [newFormationDelai, setNewFormationDelai] = useState("");
  
  const [observationComite, setObservationComite] = useState(
    "Collaborateur clé avec une excellente vision stratégique. Recommandé pour un accompagnement sur la délégation d'équipe et le management transverse."
  );

  // Mise à jour d'une note
  const handleNoteChange = (critereId: string, newNote: number) => {
    if (readOnly) return;
    setDomaines((prev) =>
      prev.map((dom) => ({
        ...dom,
        criteres: dom.criteres.map((c) =>
          c.id === critereId ? { ...c, note: Math.max(0, Math.min(5, newNote)) } : c
        ),
      }))
    );
  };

  // Calculs des moyennes par domaine
  const moyennesParDomaine = useMemo(() => {
    return domaines.map((dom) => {
      const total = dom.criteres.reduce((acc, c) => acc + c.note, 0);
      const moy = dom.criteres.length > 0 ? total / dom.criteres.length : 0;
      return { titre: dom.titre, moyenne: moy };
    });
  }, [domaines]);

  // Moyenne générale /5
  const moyenneGenerale = useMemo(() => {
    let totalNotes = 0;
    let totalCriteres = 0;
    domaines.forEach((dom) => {
      dom.criteres.forEach((c) => {
        totalNotes += c.note;
        totalCriteres += 1;
      });
    });
    return totalCriteres > 0 ? totalNotes / totalCriteres : 0;
  }, [domaines]);

  // Synthèses >= 3 et <= 3
  const rubriquesSuperieuresOuEgal3 = useMemo(() => {
    const list: string[] = [];
    domaines.forEach((dom) => {
      dom.criteres.forEach((c) => {
        if (c.note >= 3) list.push(`${c.comportement} (${c.note}/5)`);
      });
    });
    return list;
  }, [domaines]);

  const rubriquesInferieuresOuEgal3 = useMemo(() => {
    const list: string[] = [];
    domaines.forEach((dom) => {
      dom.criteres.forEach((c) => {
        if (c.note <= 3) list.push(`${c.comportement} (${c.note}/5)`);
      });
    });
    return list;
  }, [domaines]);

  const addFormation = () => {
    if (!newFormationIntitule.trim()) return;
    setFormations((prev) => [
      ...prev,
      { id: Date.now().toString(), intitule: newFormationIntitule.trim(), delai: newFormationDelai.trim() || "A préciser" },
    ]);
    setNewFormationIntitule("");
    setNewFormationDelai("");
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(4px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "#FFFFFF",
        width: "100%",
        maxWidth: 1100,
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        borderRadius: 0,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
        border: "1px solid #E2E8F0",
        overflow: "hidden",
      }}>
        
        {/* ── HEADER MODAL ── */}
        <div style={{
          padding: "20px 28px",
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          color: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "3px solid #F0822A",
        }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#F0822A" }}>
              CAMPAGNE OFFICIELLE AGILLY RHEVAL
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 900, margin: "2px 0 0 0", color: "#FFFFFF" }}>
              ÉVALUATION À 360° 2026 — MANAGERS ET CHEFS D'ÉQUIPE
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#FFFFFF",
              width: 36,
              height: 36,
              fontSize: 18,
              fontWeight: 900,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* ── CONTENU SCROLLABLE ── */}
        <div style={{ padding: 28, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 24, background: "#F8FAFC" }}>
          
          {/* SECTION 1 : INFORMATIONS DU MANAGER */}
          <div style={{ background: "#FFFFFF", padding: 20, border: "1px solid #E2E8F0" }}>
            <h3 style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", margin: "0 0 14px 0" }}>
              Informations Manager ou Chef d'équipe à évaluer
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", display: "block" }}>Nom & Prénoms</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{managerData.nomPrenoms}</span>
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", display: "block" }}>Fonction</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{managerData.fonction}</span>
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", display: "block" }}>Date d'embauche</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{managerData.dateEmbauche}</span>
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", display: "block" }}>Service</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{managerData.service}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2 : GRILLE D'ÉVALUATION 360° */}
          <div style={{ background: "#FFFFFF", padding: 24, border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#F0822A", margin: 0 }}>
                Évaluation Compétences 360° — Managers & Chefs d'Équipe
              </h3>
              <div style={{ background: "#FFF7ED", border: "1px solid #FFEDD5", padding: "6px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#C2410C" }}>Moyenne Générale 360° :</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: "#F0822A" }}>{moyenneGenerale.toFixed(2)} / 5</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {domaines.map((dom, domIdx) => {
                const domMoyenne = moyennesParDomaine.find((m) => m.titre === dom.titre)?.moyenne ?? 0;

                return (
                  <div key={dom.titre} style={{ border: "1px solid #CBD5E1", background: "#FFFFFF" }}>
                    <div style={{
                      padding: "12px 18px",
                      background: "#F1F5F9",
                      borderBottom: "1px solid #CBD5E1",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <h4 style={{ fontSize: 13, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                        {domIdx + 1}. {dom.titre}
                      </h4>
                      <span style={{ fontSize: 12, fontWeight: 900, color: "#0284C7", background: "#E0F2FE", padding: "4px 10px" }}>
                        Moyenne : {domMoyenne.toFixed(2)} / 5
                      </span>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#FAFAFA", borderBottom: "1px solid #E2E8F0" }}>
                          <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 800, color: "#64748B", width: "70%" }}>
                            Comportement Observable
                          </th>
                          <th style={{ textAlign: "center", padding: "10px 16px", fontSize: 11, fontWeight: 800, color: "#64748B", width: "30%" }}>
                            Note sur /5
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dom.criteres.map((critere) => (
                          <tr key={critere.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                            <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#334155" }}>
                              • {critere.comportement}
                            </td>
                            <td style={{ padding: "12px 16px", textAlign: "center" }}>
                              {readOnly ? (
                                <span style={{ fontSize: 14, fontWeight: 900, color: "#0F172A" }}>{critere.note} / 5</span>
                              ) : (
                                <select
                                  value={critere.note}
                                  onChange={(e) => handleNoteChange(critere.id, parseFloat(e.target.value))}
                                  style={{
                                    padding: "6px 12px",
                                    fontSize: 13,
                                    fontWeight: 900,
                                    color: "#0F172A",
                                    border: "1px solid #CBD5E1",
                                    background: "#FFFFFF",
                                    cursor: "pointer",
                                  }}
                                >
                                  <option value={5}>5 / 5 (Excellent)</option>
                                  <option value={4.5}>4.5 / 5 (Très Bien)</option>
                                  <option value={4}>4 / 5 (Bien)</option>
                                  <option value={3.5}>3.5 / 5 (Satisfaisant+)</option>
                                  <option value={3}>3 / 5 (Satisfaisant)</option>
                                  <option value={2.5}>2.5 / 5 (À Améliorer)</option>
                                  <option value={2}>2 / 5 (Insuffisant)</option>
                                  <option value={1}>1 / 5 (Critique)</option>
                                </select>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3 : SYNTHÈSE AUTOMATIQUE DES COMPÉTENCES */}
          <div style={{ background: "#FFFFFF", padding: 20, border: "1px solid #E2E8F0" }}>
            <h3 style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", margin: "0 0 14px 0" }}>
              Synthèse des Ratios de Compétence
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Rubriques >= 3 */}
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", padding: 16 }}>
                <h4 style={{ fontSize: 12, fontWeight: 900, color: "#166534", margin: "0 0 10px 0" }}>
                  ✅ Rubriques ayant Note &ge; 3 / 5 ({rubriquesSuperieuresOuEgal3.length})
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#15803D", display: "flex", flexDirection: "column", gap: 6 }}>
                  {rubriquesSuperieuresOuEgal3.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Rubriques <= 3 */}
              <div style={{ background: "#FFF7ED", border: "1px solid #FFEDD5", padding: 16 }}>
                <h4 style={{ fontSize: 12, fontWeight: 900, color: "#C2410C", margin: "0 0 10px 0" }}>
                  ⚠️ Rubriques ayant Note &le; 3 / 5 ({rubriquesInferieuresOuEgal3.length})
                </h4>
                {rubriquesInferieuresOuEgal3.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#9A3412", margin: 0 }}>Aucune rubrique en dessous de 3/5.</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#C2410C", display: "flex", flexDirection: "column", gap: 6 }}>
                    {rubriquesInferieuresOuEgal3.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4 : FORMATIONS À ENVISAGER */}
          <div style={{ background: "#FFFFFF", padding: 20, border: "1px solid #E2E8F0" }}>
            <h3 style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", margin: "0 0 14px 0" }}>
              Formations à Envisager
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 14 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 800, color: "#475569" }}>Formation à Envisager</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 800, color: "#475569" }}>Délai Prévisionnel</th>
                </tr>
              </thead>
              <tbody>
                {formations.map((f) => (
                  <tr key={f.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{f.intitule}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "#F0822A" }}>{f.delai}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!readOnly && (
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  placeholder="Intitulé de la formation..."
                  value={newFormationIntitule}
                  onChange={(e) => setNewFormationIntitule(e.target.value)}
                  style={{ flex: 2, padding: "8px 12px", border: "1px solid #CBD5E1", fontSize: 13 }}
                />
                <input
                  type="text"
                  placeholder="Délai (ex: Q3 2026)..."
                  value={newFormationDelai}
                  onChange={(e) => setNewFormationDelai(e.target.value)}
                  style={{ flex: 1, padding: "8px 12px", border: "1px solid #CBD5E1", fontSize: 13 }}
                />
                <button
                  onClick={addFormation}
                  style={{ padding: "8px 16px", background: "#0F172A", color: "#FFFFFF", fontWeight: 800, border: "none", cursor: "pointer", fontSize: 13 }}
                >
                  + Ajouter
                </button>
              </div>
            )}
          </div>

          {/* SECTION 5 : OBSERVATION COMITÉ RESTREINT (ORANGE & CONFIDENTIEL) */}
          {/* ⚠️ REGLE MÉTIER : "Les parties en orange ne doivent pas être affichées chez le salarié" */}
          {isSalarie ? (
            <div style={{ background: "#F1F5F9", padding: 14, border: "1px dashed #CBD5E1", textAlign: "center" }}>
              <span style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>
                🔒 La section réservée au Comité Restreint n'est pas accessible sur l'espace salarié.
              </span>
            </div>
          ) : (
            <div style={{
              background: "#FFF7ED",
              padding: 22,
              border: "2px solid #F0822A",
              position: "relative",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#C2410C", margin: 0 }}>
                  🔒 Observation Comité Restreint (PDG, Directeur Exécutif et DRH)
                </h3>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#FFFFFF", background: "#EA580C", padding: "4px 10px", textTransform: "uppercase" }}>
                  Section Confidentielle Comité
                </span>
              </div>
              <p style={{ fontSize: 11, color: "#9A3412", fontWeight: 700, margin: "0 0 10px 0" }}>
                ⚠️ Remarque : Cette section en orange ne doit pas être affichée chez le salarié évalué.
              </p>
              {readOnly ? (
                <div style={{ padding: 14, background: "#FFFFFF", border: "1px solid #FFEDD5", fontSize: 13, fontWeight: 600, color: "#431407" }}>
                  {observationComite}
                </div>
              ) : (
                <textarea
                  rows={4}
                  value={observationComite}
                  onChange={(e) => setObservationComite(e.target.value)}
                  placeholder="Saisissez les remarques stratégiques réservées au Comité (PDG, Directeur Exécutif et DRH)..."
                  style={{
                    width: "100%",
                    padding: 12,
                    fontSize: 13,
                    border: "1px solid #FDBA74",
                    background: "#FFFFFF",
                    color: "#0F172A",
                    resize: "vertical",
                  }}
                />
              )}
            </div>
          )}

        </div>

        {/* ── FOOTER MODAL ── */}
        <div style={{ padding: "16px 28px", background: "#FFFFFF", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Statut Évaluation :</span>{" "}
            <span style={{ fontSize: 12, fontWeight: 900, color: "#059669", background: "#D1FAE5", padding: "4px 8px" }}>
              ✓ Enregistré (360° Manager)
            </span>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() =>
                export360ToExcel({
                  managerData,
                  domaines,
                  formations,
                  observationComite,
                  isSalarie,
                })
              }
              style={{
                padding: "10px 20px",
                border: "1px solid #16A34A",
                background: "#F0FDF4",
                color: "#15803D",
                fontWeight: 900,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              📊 Télécharger la Fiche Excel (.xlsx)
            </button>

            <button
              onClick={onClose}
              style={{ padding: "10px 20px", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
            >
              Fermer
            </button>
            {!readOnly && (
              <button
                onClick={() => {
                  alert("Évaluation 360° Manager enregistrée avec succès !");
                  onClose();
                }}
                style={{ padding: "10px 24px", border: "none", background: "#F0822A", color: "#FFFFFF", fontWeight: 900, fontSize: 13, cursor: "pointer" }}
              >
                💾 Enregistrer la Fiche 360°
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
