// ============================================================
// lib/utils/exportExcelEvaluation.ts
// Générateur Excel (.xlsx) pour la Fiche d'Évaluation de Performance AGILLY RHEVAL
// Modèle officiel 1:1 conforme à la version RH d'Agilly
// ============================================================

import * as XLSX from "xlsx";

export interface EvaluationExportData {
  salarie?: {
    nom?: string;
    prenom?: string;
    matricule?: string;
    poste?: string;
    departement?: string;
    direction?: string;
    site?: string;
  };
  n1?: {
    nom?: string;
    poste?: string;
  };
  cycle?: {
    libelle?: string;
    annee?: number | string;
    dateDebut?: string;
    dateFin?: string;
  };
  statut?: string;
  noteGlobale?: number;
  objectifs: Array<{
    id?: string;
    intitule: string;
    ponderation?: number;
    description?: string;
    noteGlobale?: number;
    criteres?: {
      t18_20?: string;
      t15_17?: string;
      t12_14?: string;
      t0_11?: string;
    };
    indicateurs?: Array<{
      noteMin?: number;
      noteMax?: number;
      intitule?: string;
    }>;
    evaluations?: Array<any>;
    observation?: string;
  }>;
  formations?: Array<{
    formation?: string;
    intitule?: string;
    delai?: string;
  }>;
  observationN1?: string;
  observationSalarie?: string;
}

export function exportEvaluationToExcel(data: EvaluationExportData) {
  const wb = XLSX.utils.book_new();

  // Nom complet salarié
  const prenomSalarie = data.salarie?.prenom || "";
  const nomSalarie = data.salarie?.nom || "Collaborateur";
  const fullNameSalarie = `${prenomSalarie ? prenomSalarie + " " : ""}${nomSalarie}`.trim();

  // Informations de base
  const poste = data.salarie?.poste || "Développeur Full-Stack";
  const matricule = data.salarie?.matricule || "EMP-2026-001";
  const direction = data.salarie?.direction || data.salarie?.departement || "Executive";
  const site = data.salarie?.site || "Abidjan - AGILLY 1";
  const periode = data.cycle?.dateDebut && data.cycle?.dateFin
    ? `Du ${new Date(data.cycle.dateDebut).toLocaleDateString("fr-FR")} au ${new Date(data.cycle.dateFin).toLocaleDateString("fr-FR")}`
    : "Du 1er juin au 31 décembre 2026";

  const n1Nom = data.n1?.nom || "Marc AUBERT";
  const n1Poste = data.n1?.poste || "Responsable Technique";

  // Grille de lignes (Tableau 2D)
  const rows: (string | number)[][] = [];
  const merges: XLSX.Range[] = [];

  // Ligne 1 : Titre principal (Row 0)
  rows.push(["Fiche d'évaluation de performance", "", "", ""]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });

  // Ligne 2 : Vide (Row 1)
  rows.push([]);

  // Ligne 3 : Bannière Informations Salarié (Row 2)
  rows.push(["Informations Salarié", "", "", ""]);
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: 3 } });

  // Ligne 4-5 : En-têtes et valeurs identité salarié (Rows 3, 4)
  rows.push(["Prénoms & Nom du salarié", "Matricule", "Poste", "Ancienneté à ce poste"]);
  rows.push([fullNameSalarie, matricule, poste, "2 ans"]);

  // Ligne 6-7 : Direction, Période, Site (Rows 5, 6)
  rows.push(["Direction", "Période couverte", "Site", ""]);
  merges.push({ s: { r: 5, c: 2 }, e: { r: 5, c: 3 } });
  rows.push([direction, periode, site, ""]);
  merges.push({ s: { r: 6, c: 2 }, e: { r: 6, c: 3 } });

  // Ligne 8 : Vide (Row 7)
  rows.push([]);

  // Ligne 9 : En-tête N+1 (Row 8)
  rows.push([`N+1 : ${n1Nom} / Fonction : ${n1Poste}`, "", "", ""]);
  merges.push({ s: { r: 8, c: 0 }, e: { r: 8, c: 3 } });

  // Ligne 10 : Vide (Row 9)
  rows.push([]);

  // Ligne 11 : En-têtes du tableau d'évaluation (Row 10)
  rows.push([
    "Objectifs de Performance",
    "Indicateurs de Mesure",
    "Note Obtenue /20",
    "Commentaires & Justification (facultatif)",
  ]);

  // Objectifs
  let currentRow = 11;

  if (data.objectifs && data.objectifs.length > 0) {
    data.objectifs.forEach((obj, idx) => {
      const objTitle = `OBJECTIF DE PERFORMANCE ${idx + 1}:\n${obj.intitule}${
        obj.ponderation ? `\nPondération : ${obj.ponderation}%` : ""
      }`;

      // Extraction des 4 critères
      const crit18 =
        obj.criteres?.t18_20 ||
        obj.indicateurs?.find((i) => Number(i.noteMin) >= 18)?.intitule ||
        obj.indicateurs?.[0]?.intitule ||
        "Performance exceptionnelle au-delà des attentes.";

      const crit15 =
        obj.criteres?.t15_17 ||
        obj.indicateurs?.find((i) => Number(i.noteMin) === 15)?.intitule ||
        obj.indicateurs?.[1]?.intitule ||
        "Objectif pleinement atteint selon les spécifications.";

      const crit12 =
        obj.criteres?.t12_14 ||
        obj.indicateurs?.find((i) => Number(i.noteMin) === 12)?.intitule ||
        obj.indicateurs?.[2]?.intitule ||
        "Objectif partiellement atteint avec réajustements mineurs.";

      const crit0 =
        obj.criteres?.t0_11 ||
        obj.indicateurs?.find((i) => Number(i.noteMin) === 0)?.intitule ||
        obj.indicateurs?.[3]?.intitule ||
        "Objectif non atteint ou écart significatif.";

      const noteCell = obj.noteGlobale !== undefined && obj.noteGlobale !== null
        ? Number(obj.noteGlobale)
        : "";

      const commentaireCell = obj.observation || "";

      // 4 Lignes par objectif
      rows.push([objTitle, crit18, "18–20", noteCell]);
      rows.push(["", crit15, "15–17", ""]);
      rows.push(["", crit12, "12–14", ""]);
      rows.push(["", crit0, "0–11", commentaireCell]);

      // Fusionner la colonne Objectif sur les 4 lignes
      merges.push({
        s: { r: currentRow, c: 0 },
        e: { r: currentRow + 3, c: 0 },
      });

      // Fusionner la colonne Commentaire sur les 4 lignes
      merges.push({
        s: { r: currentRow, c: 3 },
        e: { r: currentRow + 3, c: 3 },
      });

      currentRow += 4;
    });
  } else {
    // Si aucun objectif encore défini
    rows.push(["Aucun objectif défini", "En attente de fixation par le N+1", "—", ""]);
    currentRow += 1;
  }

  // Ligne vide avant les formations
  rows.push([]);
  currentRow += 1;

  // Section Formation à envisager
  rows.push(["Formation à envisager", "", "Delai", ""]);
  merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 1 } });
  merges.push({ s: { r: currentRow, c: 2 }, e: { r: currentRow, c: 3 } });
  currentRow += 1;

  if (data.formations && data.formations.length > 0) {
    data.formations.forEach((f) => {
      const formNom = f.formation || f.intitule || "Formation technique";
      const delai = f.delai || "Q1 2027";
      rows.push([formNom, "", delai, ""]);
      merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 1 } });
      merges.push({ s: { r: currentRow, c: 2 }, e: { r: currentRow, c: 3 } });
      currentRow += 1;
    });
  } else {
    // Lignes vierges pour saisie
    rows.push(["", "", "", ""]);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 1 } });
    merges.push({ s: { r: currentRow, c: 2 }, e: { r: currentRow, c: 3 } });
    currentRow += 1;

    rows.push(["", "", "", ""]);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 1 } });
    merges.push({ s: { r: currentRow, c: 2 }, e: { r: currentRow, c: 3 } });
    currentRow += 1;
  }

  // Ligne vide
  rows.push([]);
  currentRow += 1;

  // Box Signature Supérieur Hiérarchique N+1
  rows.push(["Observation, Signature du Supérieur Hiérarchique et date", "", "", ""]);
  merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 3 } });
  currentRow += 1;

  // 3 lignes d'espace pour la signature N+1
  const obsN1 = data.observationN1 || "";
  rows.push([obsN1, "", "", ""]);
  merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow + 2, c: 3 } });
  rows.push([]);
  rows.push([]);
  currentRow += 3;

  // Ligne vide
  rows.push([]);
  currentRow += 1;

  // Box Signature Salarié
  rows.push(["Observation, Signature de l'évalué et date", "", "", ""]);
  merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 3 } });
  currentRow += 1;

  // 3 lignes d'espace pour la signature salarié
  const obsSalarie = data.observationSalarie || "";
  rows.push([obsSalarie, "", "", ""]);
  merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow + 2, c: 3 } });
  rows.push([]);
  rows.push([]);
  currentRow += 3;

  // Conversion en feuille Excel
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Application des fusions de cellules
  ws["!merges"] = merges;

  // Largeurs de colonnes optimisées (A, B, C, D)
  ws["!cols"] = [
    { wch: 32 }, // Col A : Objectif
    { wch: 68 }, // Col B : Indicateurs de Mesure (texte long)
    { wch: 18 }, // Col C : Note Obtenue /20
    { wch: 38 }, // Col D : Commentaires & Justification
  ];

  // Nom de la feuille : "Fiche évaluation version RH" (exactement comme le modèle officiel)
  XLSX.utils.book_append_sheet(wb, ws, "Fiche évaluation version RH");

  // Nom du fichier généré
  const cleanName = fullNameSalarie.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `AGILLY_RHEVAL_${cleanName}_2026.xlsx`;

  // Téléchargement dans le navigateur
  XLSX.writeFile(wb, fileName);
}
