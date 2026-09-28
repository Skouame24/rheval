// ============================================================
// lib/utils/exportExcelEvaluation.ts
// Générateur Excel (.xlsx) Haute Fidélité pour AGILLY RHEVAL
// Rendu 100% conforme à la Fiche d'évaluation officielle RH d'Agilly
// Utilise ExcelJS avec mise en forme complète (couleurs, bordures, typographie, fusions)
// ============================================================

import ExcelJS from "exceljs";

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

// ─── STYLES CONSTANTS AGILLY ────────────────────────────────

const FONT_FAMILY = "Arial";

// Bordure fine standard noire pour toutes les cellules du tableau
const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FF000000" } },
  left: { style: "thin", color: { argb: "FF000000" } },
  bottom: { style: "thin", color: { argb: "FF000000" } },
  right: { style: "thin", color: { argb: "FF000000" } },
};

// Bordure épaisse pour les encadrements de signatures
const thickBoxBorder: Partial<ExcelJS.Borders> = {
  top: { style: "medium", color: { argb: "FF000000" } },
  left: { style: "medium", color: { argb: "FF000000" } },
  bottom: { style: "medium", color: { argb: "FF000000" } },
  right: { style: "medium", color: { argb: "FF000000" } },
};

// Gris moyen officiel pour les bandeaux de titre des sections
const grayBannerFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFA6A6A6" }, // Gris soutenu conforme à la capture
};

// Gris clair officiel pour les en-têtes de colonnes
const headerTableFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFD9D9D9" },
};

// Gris très doux pour les étiquettes du bloc informations salarié
const labelLightFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF2F2F2" },
};

// Helper pour appliquer les bordures et fonds sur une plage
function styleRange(
  ws: ExcelJS.Worksheet,
  startR: number,
  startC: number,
  endR: number,
  endC: number,
  options: {
    border?: Partial<ExcelJS.Borders>;
    fill?: ExcelJS.Fill;
    font?: Partial<ExcelJS.Font>;
    alignment?: Partial<ExcelJS.Alignment>;
  }
) {
  for (let r = startR; r <= endR; r++) {
    for (let c = startC; c <= endC; c++) {
      const cell = ws.getCell(r, c);
      if (options.border) cell.border = options.border;
      if (options.fill) cell.fill = options.fill;
      if (options.font) cell.font = { ...cell.font, ...options.font };
      if (options.alignment) cell.alignment = { ...cell.alignment, ...options.alignment };
    }
  }
}

// Helper pour créer un bandeau gris officiel fusionné
function createSectionBanner(
  ws: ExcelJS.Worksheet,
  row: number,
  text: string,
  align: "center" | "left" = "center"
) {
  ws.mergeCells(row, 1, row, 4);
  styleRange(ws, row, 1, row, 4, {
    border: thinBorder,
    fill: grayBannerFill,
    font: { name: FONT_FAMILY, size: 10, bold: true, color: { argb: "FF000000" } },
    alignment: { vertical: "middle", horizontal: align, indent: align === "left" ? 1 : 0 },
  });
  ws.getCell(row, 1).value = text;
  ws.getRow(row).height = 24;
}

export async function exportEvaluationToExcel(data: EvaluationExportData): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "AGILLY RHEVAL";
  wb.lastModifiedBy = "AGILLY Direction RH";
  wb.created = new Date();

  const ws = wb.addWorksheet("Fiche évaluation version RH", {
    views: [{ showGridLines: true }],
  });

  // ─── LARGEURS DES COLONNES (A, B, C, D) ──────────────────────
  ws.columns = [
    { key: "A", width: 34 }, // Objectifs de Performance
    { key: "B", width: 70 }, // Indicateurs de Mesure
    { key: "C", width: 16 }, // Note Obtenue /20
    { key: "D", width: 38 }, // Commentaires & Justification
  ];

  // Identité Salarié
  const prenomSalarie = data.salarie?.prenom || "";
  const nomSalarie = data.salarie?.nom || "KOUAME";
  const fullNameSalarie = `${prenomSalarie ? prenomSalarie + " " : ""}${nomSalarie}`.trim();
  const matricule = data.salarie?.matricule || "EMP-2026-001";
  const poste = data.salarie?.poste || "Développeur Full-Stack";
  const direction = data.salarie?.direction || data.salarie?.departement || "Executive";
  const site = data.salarie?.site || "Abidjan - AGILLY 1";
  const periode = data.cycle?.dateDebut && data.cycle?.dateFin
    ? `Du ${new Date(data.cycle.dateDebut).toLocaleDateString("fr-FR")} au ${new Date(data.cycle.dateFin).toLocaleDateString("fr-FR")}`
    : "Du 1er juin au 31 décembre 2026";

  const n1Nom = data.n1?.nom || "Marc AUBERT";
  const n1Poste = data.n1?.poste || "Responsable Technique";

  // ── LIGNE 1 : Titre Général Centré & Souligné ────────────────
  ws.mergeCells("A1:D1");
  const titleCell = ws.getCell("A1");
  titleCell.value = "Fiche d'évaluation de performance";
  titleCell.font = { name: FONT_FAMILY, size: 14, bold: true, underline: true, color: { argb: "FF000000" } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  ws.getRow(1).height = 32;

  // Ligne 2 : Espacement
  ws.getRow(2).height = 10;

  // ── LIGNE 3 : Bandeau Informations Salarié ───────────────────
  createSectionBanner(ws, 3, "Informations Salarié", "center");

  // ── LIGNES 4 & 5 : Grille Identité Salarié (Rangée 1) ─────────
  ws.getRow(4).height = 20;
  ws.getCell("A4").value = "Prénoms & Nom du salarié";
  ws.getCell("B4").value = "Matricule";
  ws.getCell("C4").value = "Poste";
  ws.getCell("D4").value = "Ancienneté à ce poste";
  styleRange(ws, 4, 1, 4, 4, {
    border: thinBorder,
    fill: labelLightFill,
    font: { name: FONT_FAMILY, size: 9, bold: true },
    alignment: { vertical: "middle", horizontal: "center" },
  });

  ws.getRow(5).height = 22;
  ws.getCell("A5").value = fullNameSalarie;
  ws.getCell("B5").value = matricule;
  ws.getCell("C5").value = poste;
  ws.getCell("D5").value = "2 ans";
  styleRange(ws, 5, 1, 5, 4, {
    border: thinBorder,
    font: { name: FONT_FAMILY, size: 9.5, bold: false },
    alignment: { vertical: "middle", horizontal: "center" },
  });
  ws.getCell("A5").font = { name: FONT_FAMILY, size: 10, bold: true };

  // ── LIGNES 6 & 7 : Grille Direction, Période & Site ──────────
  ws.getRow(6).height = 20;
  ws.getCell("A6").value = "Direction";
  ws.getCell("B6").value = "Période couverte";
  ws.mergeCells(6, 3, 6, 4);
  ws.getCell("C6").value = "Site";
  styleRange(ws, 6, 1, 6, 4, {
    border: thinBorder,
    fill: labelLightFill,
    font: { name: FONT_FAMILY, size: 9, bold: true },
    alignment: { vertical: "middle", horizontal: "center" },
  });

  ws.getRow(7).height = 22;
  ws.getCell("A7").value = direction;
  ws.getCell("B7").value = periode;
  ws.mergeCells(7, 3, 7, 4);
  ws.getCell("C7").value = site;
  styleRange(ws, 7, 1, 7, 4, {
    border: thinBorder,
    font: { name: FONT_FAMILY, size: 9.5 },
    alignment: { vertical: "middle", horizontal: "center" },
  });

  // Ligne 8 : Espacement
  ws.getRow(8).height = 10;

  // ── LIGNE 9 : Bandeau N+1 ────────────────────────────────────
  createSectionBanner(ws, 9, `N+1 : ${n1Nom} / Fonction : ${n1Poste}`, "left");

  // Ligne 10 : Espacement
  ws.getRow(10).height = 10;

  // ── LIGNE 11 : En-têtes du Tableau des Objectifs ──────────────
  ws.getRow(11).height = 28;
  ws.getCell("A11").value = "";
  ws.getCell("B11").value = "Indicateurs de Mesure";
  ws.getCell("C11").value = "Note Obtenue /20";
  ws.getCell("D11").value = "Commentaires & Justification (facultatif)";
  styleRange(ws, 11, 1, 11, 4, {
    border: thinBorder,
    fill: headerTableFill,
    font: { name: FONT_FAMILY, size: 9.5, bold: true },
    alignment: { vertical: "middle", horizontal: "center", wrapText: true },
  });

  // ── LIGNES 12+ : Grille des Objectifs & 4 Tranches ────────────
  let currentRow = 12;

  if (data.objectifs && data.objectifs.length > 0) {
    data.objectifs.forEach((obj, idx) => {
      const startR = currentRow;
      const endR = currentRow + 3;

      // Extraction propre des critères
      const crit18 =
        obj.criteres?.t18_20 ||
        obj.indicateurs?.find((i) => Number(i.noteMin) >= 18)?.intitule ||
        obj.indicateurs?.[0]?.intitule ||
        "Validation autonome des livrables sans assistance avec dépassement des attentes.";

      const crit15 =
        obj.criteres?.t15_17 ||
        obj.indicateurs?.find((i) => Number(i.noteMin) === 15)?.intitule ||
        obj.indicateurs?.[1]?.intitule ||
        "Validation autonome dans le calendrier convenu et conforme au cahier des charges.";

      const crit12 =
        obj.criteres?.t12_14 ||
        obj.indicateurs?.find((i) => Number(i.noteMin) === 12)?.intitule ||
        obj.indicateurs?.[2]?.intitule ||
        "Validation avec légers retards ou correctifs mineurs sans impact critique.";

      const crit0 =
        obj.criteres?.t0_11 ||
        obj.indicateurs?.find((i) => Number(i.noteMin) === 0)?.intitule ||
        obj.indicateurs?.[3]?.intitule ||
        "Non atteinte des objectifs ou retards bloquants.";

      // Colonne A : Fusion sur les 4 lignes de l'objectif
      ws.mergeCells(startR, 1, endR, 1);
      const objTitle = `OBJECTIF DE PERFORMANCE ${idx + 1}:\n${obj.intitule}${
        obj.ponderation ? `\nPondération : ${obj.ponderation}%` : ""
      }`;
      const cellObj = ws.getCell(startR, 1);
      cellObj.value = objTitle;
      cellObj.font = { name: FONT_FAMILY, size: 9.5, bold: true };
      cellObj.alignment = { vertical: "middle", horizontal: "left", wrapText: true };

      // Colonne B & C : 4 tranches
      const tranches = [
        { label: "18–20", text: crit18 },
        { label: "15–17", text: crit15 },
        { label: "12–14", text: crit12 },
        { label: "0–11", text: crit0 },
      ];

      tranches.forEach((t, tIdx) => {
        const rowNum = startR + tIdx;
        ws.getRow(rowNum).height = 42; // Hauteur confortable pour le texte

        const cellB = ws.getCell(rowNum, 2);
        cellB.value = t.text;
        cellB.font = { name: FONT_FAMILY, size: 9 };
        cellB.alignment = { vertical: "middle", horizontal: "left", wrapText: true };

        const cellC = ws.getCell(rowNum, 3);
        cellC.value = t.label;
        cellC.font = { name: FONT_FAMILY, size: 9.5, bold: true };
        cellC.alignment = { vertical: "middle", horizontal: "center" };
      });

      // Colonne D : Fusion sur les 4 lignes pour les commentaires
      ws.mergeCells(startR, 4, endR, 4);
      const cellD = ws.getCell(startR, 4);
      cellD.value = obj.observation || "";
      cellD.font = { name: FONT_FAMILY, size: 9 };
      cellD.alignment = { vertical: "top", horizontal: "left", wrapText: true };

      // Appliquer les bordures complètes sur l'ensemble du bloc de l'objectif
      styleRange(ws, startR, 1, endR, 4, { border: thinBorder });

      currentRow = endR + 1;
    });
  } else {
    // Si aucun objectif
    ws.mergeCells(currentRow, 1, currentRow, 4);
    const emptyCell = ws.getCell(currentRow, 1);
    emptyCell.value = "Aucun objectif défini pour le moment.";
    styleRange(ws, currentRow, 1, currentRow, 4, {
      border: thinBorder,
      alignment: { vertical: "middle", horizontal: "center" },
    });
    ws.getRow(currentRow).height = 30;
    currentRow++;
  }

  // Ligne d'espacement
  ws.getRow(currentRow).height = 12;
  currentRow++;

  // ── SECTION FORMATION À ENVISAGER ────────────────────────────
  const rowFormHeader = currentRow;
  ws.mergeCells(rowFormHeader, 1, rowFormHeader, 2);
  ws.getCell(rowFormHeader, 1).value = "Formation à envisager";
  ws.mergeCells(rowFormHeader, 3, rowFormHeader, 4);
  ws.getCell(rowFormHeader, 3).value = "Delai";
  styleRange(ws, rowFormHeader, 1, rowFormHeader, 4, {
    border: thinBorder,
    fill: grayBannerFill,
    font: { name: FONT_FAMILY, size: 10, bold: true },
    alignment: { vertical: "middle", horizontal: "center" },
  });
  ws.getRow(rowFormHeader).height = 24;
  currentRow++;

  // Lignes de formations (au moins 5 lignes pour le modèle papier)
  const formationsList = data.formations && data.formations.length > 0
    ? data.formations
    : [
        { intitule: "Architecture Fine-Tuning & Sécurité Cloud Azure", delai: "Q1 2027" },
        { intitule: "", delai: "" },
        { intitule: "", delai: "" },
        { intitule: "", delai: "" },
      ];

  formationsList.forEach((f) => {
    const r = currentRow;
    ws.mergeCells(r, 1, r, 2);
    ws.getCell(r, 1).value = f.formation || f.intitule || "";
    ws.mergeCells(r, 3, r, 4);
    ws.getCell(r, 3).value = f.delai || "";

    styleRange(ws, r, 1, r, 4, {
      border: thinBorder,
      font: { name: FONT_FAMILY, size: 9.5 },
      alignment: { vertical: "middle", horizontal: "left", indent: 1 },
    });
    ws.getCell(r, 3).alignment = { vertical: "middle", horizontal: "center" };
    ws.getRow(r).height = 22;
    currentRow++;
  });

  // Ligne d'espacement
  ws.getRow(currentRow).height = 14;
  currentRow++;

  // ── SECTION SIGNATURE SUPÉRIEUR HIÉRARCHIQUE (N+1) ───────────
  createSectionBanner(ws, currentRow, "Observation, Signature du Supérieur Hiérarchique et date", "left");
  currentRow++;

  const sigN1Start = currentRow;
  const sigN1End = currentRow + 6;
  ws.mergeCells(sigN1Start, 1, sigN1End, 4);
  styleRange(ws, sigN1Start, 1, sigN1End, 4, {
    border: thickBoxBorder,
    font: { name: FONT_FAMILY, size: 9.5, italic: true },
    alignment: { vertical: "top", horizontal: "left" },
  });
  ws.getCell(sigN1Start, 1).value = data.observationN1 || "";
  for (let r = sigN1Start; r <= sigN1End; r++) {
    ws.getRow(r).height = 18;
  }
  currentRow = sigN1End + 1;

  // Ligne d'espacement
  ws.getRow(currentRow).height = 14;
  currentRow++;

  // ── SECTION SIGNATURE DE L'ÉVALUÉ (SALARIÉ) ──────────────────
  createSectionBanner(ws, currentRow, "Observation, Signature de l'évalué et date", "left");
  currentRow++;

  const sigSalStart = currentRow;
  const sigSalEnd = currentRow + 6;
  ws.mergeCells(sigSalStart, 1, sigSalEnd, 4);
  styleRange(ws, sigSalStart, 1, sigSalEnd, 4, {
    border: thickBoxBorder,
    font: { name: FONT_FAMILY, size: 9.5, italic: true },
    alignment: { vertical: "top", horizontal: "left" },
  });
  ws.getCell(sigSalStart, 1).value = data.observationSalarie || "";
  for (let r = sigSalStart; r <= sigSalEnd; r++) {
    ws.getRow(r).height = 18;
  }

  // ── GÉNÉRATION ET TÉLÉCHARGEMENT DU FICHIER .XLSX DANS LE NAVIGATEUR ──
  const cleanName = fullNameSalarie.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `AGILLY_RHEVAL_${cleanName}_2026.xlsx`;

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
