// ============================================================
// lib/utils/exportPointCampagneRH.ts
// Export du Point Global & Bilan de Campagne d'Évaluation pour la Direction RH
// Générateur Excel (.xlsx) Haute Fidélité — Agilly Soft UI Enterprise
// ============================================================

import ExcelJS from "exceljs";
import type { EvaluationCycle, Cycle } from "@/types";
import type { RhDashboardStats } from "@/lib/api/rh.api";

const FONT_FAMILY = "Segoe UI";

function getEtapeLabel(statut: string): string {
  switch (statut) {
    case "CLOTURE":
    case "CLOTUREE":
    case "VALIDE":
      return "Étape 8 - Clôturé & Archivé";
    case "ACCORD_SALARIE":
    case "VISA_SALARIE":
      return "Étape 7 - En attente Accord Salarié";
    case "VALIDATION_NOTES_N2":
    case "EVALUATION_N2":
    case "VALIDATION_N2":
    case "EN_ATTENTE_N2":
      return "Étape 6 - En attente Validation Note N+2";
    case "EVALUATION_N1":
    case "EN_ATTENTE_N1":
    case "AUTO_EVALUATION":
      return "Étape 5 - Évaluation & Notation N+1";
    case "VALIDATION_OBJECTIFS_SALARIE":
      return "Étape 4 - En attente Accord Objectifs Salarié";
    case "VALIDATION_OBJECTIFS_N2":
      return "Étape 3 - En attente Validation Objectifs N+2";
    case "VALIDATION_OBJECTIFS_RH":
      return "Étape 2 - En attente Validation Objectifs RH";
    case "FIXATION_OBJECTIFS":
      return "Étape 1 - Fixation Objectifs N+1";
    case "ARBITRAGE":
    case "ARBITRAGE_RH":
    case "VALIDATION_DRH":
      return "⚖ Litige / Arbitrage RH en cours";
    default:
      return statut || "Non défini";
  }
}

export async function exportPointCampagneRHToExcel(
  dossiers: EvaluationCycle[],
  cycle?: Cycle | null,
  stats?: RhDashboardStats | null
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "AGILLY RHEVAL ENTERPRISE";
  wb.lastModifiedBy = "Direction des Ressources Humaines";
  wb.created = new Date();
  wb.modified = new Date();

  // ══════════════════════════════════════════════════════════════
  // FEUILLE 1 : POINT DE CAMPAGNE RH (ÉTAT DES LIEUX CONSOLIDÉ)
  // ══════════════════════════════════════════════════════════════
  const ws = wb.addWorksheet("Point de Campagne RH", {
    views: [{ showGridLines: true }],
  });

  // Largeurs des colonnes
  ws.columns = [
    { key: "num", width: 6 },
    { key: "collaborateur", width: 28 },
    { key: "matricule", width: 14 },
    { key: "poste", width: 28 },
    { key: "direction", width: 24 },
    { key: "managerN1", width: 24 },
    { key: "directionN2", width: 24 },
    { key: "nbObj", width: 14 },
    { key: "etape", width: 34 },
    { key: "statutTech", width: 22 },
    { key: "noteFinale", width: 16 },
    { key: "tauxAtteinte", width: 16 },
    { key: "eligibiliteBonus", width: 24 },
    { key: "nbFormations", width: 16 },
    { key: "arbitrage", width: 20 },
  ];

  // 1. En-tête officiel Agilly
  ws.mergeCells("A1:O1");
  const cellA1 = ws.getCell("A1");
  cellA1.value = "AGILLY RHEVAL — POINT D'AVANCEMENT & SYNTHÈSE DE LA CAMPAGNE D'ÉVALUATION";
  cellA1.font = { name: FONT_FAMILY, size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  cellA1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0822A" } };
  cellA1.alignment = { vertical: "middle", horizontal: "center" };
  ws.getRow(1).height = 36;

  ws.mergeCells("A2:O2");
  const cellA2 = ws.getCell("A2");
  const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const heureStr = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  cellA2.value = `Campagne : ${cycle?.libelle || "Campagne d'Évaluation Annuelle 2026"} | Date d'export : ${dateStr} à ${heureStr} | Émis par : Direction des Ressources Humaines (DRH)`;
  cellA2.font = { name: FONT_FAMILY, size: 9.5, italic: true, color: { argb: "FF334155" } };
  cellA2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
  cellA2.alignment = { vertical: "middle", horizontal: "center" };
  ws.getRow(2).height = 24;

  // Ligne vide
  ws.getRow(3).height = 12;

  // 2. Bloc Synthèse / KPIs (Lignes 4 à 6)
  const totalCollaborateurs = dossiers.length;
  const clotures = dossiers.filter((d) => ["CLOTURE", "CLOTUREE", "VALIDE"].includes(d.statut)).length;
  const pctClotures = totalCollaborateurs > 0 ? Math.round((clotures / totalCollaborateurs) * 100) : 0;
  
  const notesExistantes = dossiers
    .map((d) => (d.noteGlobale != null ? Number(d.noteGlobale) : null))
    .filter((n): n is number => n !== null && !isNaN(n));
  
  const moyenneGenerale = notesExistantes.length > 0
    ? (notesExistantes.reduce((a, b) => a + b, 0) / notesExistantes.length).toFixed(2)
    : "—";

  const tauxMoyen = notesExistantes.length > 0
    ? ((Number(moyenneGenerale) / 20) * 100).toFixed(1)
    : "—";

  const nbBonus = dossiers.filter((d) => {
    if (d.noteGlobale == null) return false;
    const note = Number(d.noteGlobale);
    return (note / 20) * 100 >= 60;
  }).length;

  const nbArbitrages = dossiers.filter((d) => ["ARBITRAGE", "ARBITRAGE_RH", "VALIDATION_DRH"].includes(d.statut)).length;

  // Bandeau des KPIs
  ws.mergeCells("A4:C4");
  ws.getCell("A4").value = "COLLABORATEURS";
  ws.mergeCells("A5:C5");
  ws.getCell("A5").value = `${totalCollaborateurs} dossier(s)`;

  ws.mergeCells("D4:F4");
  ws.getCell("D4").value = "AVANCEMENT CLÔTURÉ";
  ws.mergeCells("D5:F5");
  ws.getCell("D5").value = `${clotures} / ${totalCollaborateurs} (${pctClotures}%)`;

  ws.mergeCells("G4:I4");
  ws.getCell("G4").value = "MOYENNE GLOBALE";
  ws.mergeCells("G5:I5");
  ws.getCell("G5").value = moyenneGenerale !== "—" ? `${moyenneGenerale} / 20 (${tauxMoyen}%)` : "En cours";

  ws.mergeCells("J4:L4");
  ws.getCell("J4").value = "ÉLIGIBLES BONUS (≥ 60%)";
  ws.mergeCells("J5:L5");
  ws.getCell("J5").value = `${nbBonus} collaborateur(s)`;

  ws.mergeCells("M4:O4");
  ws.getCell("M4").value = "LITIGES / ARBITRAGES";
  ws.mergeCells("M5:O5");
  ws.getCell("M5").value = nbArbitrages > 0 ? `⚠ ${nbArbitrages} dossier(s)` : "✓ Aucun litige";

  // Style des KPIs
  const kpiLabels = ["A4", "D4", "G4", "J4", "M4"];
  kpiLabels.forEach((cellRef) => {
    const c = ws.getCell(cellRef);
    c.font = { name: FONT_FAMILY, size: 8.5, bold: true, color: { argb: "FF64748B" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
    c.alignment = { vertical: "middle", horizontal: "center" };
  });

  const kpiValues = ["A5", "D5", "G5", "J5", "M5"];
  kpiValues.forEach((cellRef) => {
    const c = ws.getCell(cellRef);
    c.font = { name: FONT_FAMILY, size: 12, bold: true, color: { argb: "FF0F172A" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
    c.alignment = { vertical: "middle", horizontal: "center" };
  });

  ws.getRow(4).height = 18;
  ws.getRow(5).height = 24;
  ws.getRow(6).height = 14;

  // 3. En-tête des Colonnes du Tableau
  const headers = [
    "N°",
    "Collaborateur",
    "Matricule",
    "Poste",
    "Direction / Département",
    "Manager N+1",
    "Direction N+2",
    "Nb Objectifs",
    "Étape Workflow Actuelle",
    "Statut Système",
    "Note / 20",
    "Taux d'Atteinte",
    "Éligibilité Bonus",
    "Nb Formations",
    "Arbitrage RH",
  ];

  const headerRow = ws.getRow(7);
  headerRow.height = 26;
  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: FONT_FAMILY, size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FF334155" } },
      bottom: { style: "medium", color: { argb: "FFF0822A" } },
      left: { style: "thin", color: { argb: "FF334155" } },
      right: { style: "thin", color: { argb: "FF334155" } },
    };
  });

  // 4. Données Collaborateur par Collaborateur
  let currentRow = 8;
  dossiers.forEach((item, index) => {
    const r = ws.getRow(currentRow);
    r.height = 22;

    const salarie = item.salarie;
    const nomComplet = `${salarie?.nom || ""} ${salarie?.prenom || ""}`.trim() || "Collaborateur";
    const matricule = (salarie as any)?.matricule || "N/A";
    const poste = salarie?.poste || "Collaborateur";
    const direction = (salarie as any)?.direction || (salarie as any)?.departement || "Direction";
    const n1 = (salarie as any)?.n1 ? `${(salarie as any).n1.prenom || ""} ${(salarie as any).n1.nom || ""}`.trim() : "Manager N+1";
    const n2 = (salarie as any)?.n2 ? `${(salarie as any).n2.prenom || ""} ${(salarie as any).n2.nom || ""}`.trim() : "Direction N+2";
    const nbObj = item.objectifs?.length || 0;
    const etapeLabel = getEtapeLabel(item.statut);
    const noteNum = item.noteGlobale != null ? Number(item.noteGlobale) : null;
    const tauxNum = noteNum != null ? (noteNum / 20) * 100 : null;

    let bonusText = "En attente de note";
    let bonusBg = "FFF8FAFC";
    let bonusColor = "FF64748B";

    if (tauxNum != null) {
      if (tauxNum > 75) {
        bonusText = "OUI (Performance > 75%)";
        bonusBg = "FFECFDF5";
        bonusColor = "FF047857";
      } else if (tauxNum >= 60) {
        bonusText = "OUI (Standard 60-75%)";
        bonusBg = "FFFFF7ED";
        bonusColor = "FFC2410C";
      } else {
        bonusText = "NON (< 60%)";
        bonusBg = "FFFEF2F2";
        bonusColor = "FFB91C1C";
      }
    }

    const nbFormations = (item as any)?.formations?.length || 0;
    const isArbitrage = ["ARBITRAGE", "ARBITRAGE_RH", "VALIDATION_DRH"].includes(item.statut);

    // Remplissage des cellules
    r.getCell(1).value = index + 1;
    r.getCell(2).value = nomComplet;
    r.getCell(3).value = matricule;
    r.getCell(4).value = poste;
    r.getCell(5).value = direction;
    r.getCell(6).value = n1;
    r.getCell(7).value = n2;
    r.getCell(8).value = nbObj;
    r.getCell(9).value = etapeLabel;
    r.getCell(10).value = item.statut;
    r.getCell(11).value = noteNum != null ? Number(noteNum.toFixed(2)) : "—";
    r.getCell(12).value = tauxNum != null ? `${tauxNum.toFixed(1)}%` : "—";
    r.getCell(13).value = bonusText;
    r.getCell(14).value = nbFormations;
    r.getCell(15).value = isArbitrage ? "⚠ Arbitrage RH requis" : "Aucun litige";

    // Styles de lignes
    const isAlt = index % 2 === 1;
    const rowBg = isAlt ? "FFF8FAFC" : "FFFFFFFF";

    for (let c = 1; c <= 15; c++) {
      const cell = r.getCell(c);
      cell.font = { name: FONT_FAMILY, size: 9, color: { argb: "FF0F172A" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
      cell.alignment = { vertical: "middle", horizontal: "left" };
    }

    // Alignements spécifiques
    r.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
    r.getCell(3).alignment = { vertical: "middle", horizontal: "center" };
    r.getCell(8).alignment = { vertical: "middle", horizontal: "center" };
    r.getCell(10).alignment = { vertical: "middle", horizontal: "center" };
    r.getCell(11).alignment = { vertical: "middle", horizontal: "center" };
    r.getCell(12).alignment = { vertical: "middle", horizontal: "center" };
    r.getCell(13).alignment = { vertical: "middle", horizontal: "center" };
    r.getCell(14).alignment = { vertical: "middle", horizontal: "center" };
    r.getCell(15).alignment = { vertical: "middle", horizontal: "center" };

    // Format gras sur note et taux
    if (noteNum != null) {
      r.getCell(11).font = { name: FONT_FAMILY, size: 9.5, bold: true, color: { argb: "FFF0822A" } };
      r.getCell(12).font = { name: FONT_FAMILY, size: 9.5, bold: true, color: { argb: "FF059669" } };
    }

    // Badge couleur sur bonus
    r.getCell(13).fill = { type: "pattern", pattern: "solid", fgColor: { argb: bonusBg } };
    r.getCell(13).font = { name: FONT_FAMILY, size: 8.5, bold: true, color: { argb: bonusColor } };

    // Badge arbitrage
    if (isArbitrage) {
      r.getCell(15).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF2F2" } };
      r.getCell(15).font = { name: FONT_FAMILY, size: 8.5, bold: true, color: { argb: "FFB91C1C" } };
    }

    currentRow++;
  });

  // ══════════════════════════════════════════════════════════════
  // FEUILLE 2 : PLAN DE FORMATION & DÉVELOPPEMENT DES COMPÉTENCES
  // ══════════════════════════════════════════════════════════════
  const wsFormations = wb.addWorksheet("Plan de Formations RH", {
    views: [{ showGridLines: true }],
  });

  wsFormations.columns = [
    { key: "num", width: 6 },
    { key: "collaborateur", width: 28 },
    { key: "poste", width: 28 },
    { key: "direction", width: 24 },
    { key: "manager", width: 24 },
    { key: "intitule", width: 40 },
    { key: "delai", width: 20 },
    { key: "priorite", width: 16 },
    { key: "objectif", width: 36 },
  ];

  wsFormations.mergeCells("A1:I1");
  const fHeader = wsFormations.getCell("A1");
  fHeader.value = "AGILLY RHEVAL — BESOINS EN FORMATION & DÉVELOPPEMENT DES COMPÉTENCES RECENSÉS";
  fHeader.font = { name: FONT_FAMILY, size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  fHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF059669" } };
  fHeader.alignment = { vertical: "middle", horizontal: "center" };
  wsFormations.getRow(1).height = 32;

  const fCols = [
    "N°",
    "Collaborateur",
    "Poste",
    "Direction / Département",
    "Manager N+1",
    "Intitulé de la Formation Souhaitée",
    "Échéance / Délai",
    "Priorité",
    "Objectif Professionnel Visé",
  ];

  const fColRow = wsFormations.getRow(3);
  fColRow.height = 24;
  fCols.forEach((col, idx) => {
    const c = fColRow.getCell(idx + 1);
    c.value = col;
    c.font = { name: FONT_FAMILY, size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
    c.alignment = { vertical: "middle", horizontal: "center" };
  });

  let fRowIdx = 4;
  let formationCount = 0;

  dossiers.forEach((item) => {
    const salarie = item.salarie;
    const nomComplet = `${salarie?.nom || ""} ${salarie?.prenom || ""}`.trim() || "Collaborateur";
    const poste = salarie?.poste || "Collaborateur";
    const direction = (salarie as any)?.direction || (salarie as any)?.departement || "Direction";
    const n1 = (salarie as any)?.n1 ? `${(salarie as any).n1.prenom || ""} ${(salarie as any).n1.nom || ""}`.trim() : "Manager N+1";
    const formations = (item as any)?.formations || [];

    formations.forEach((f: any) => {
      formationCount++;
      const r = wsFormations.getRow(fRowIdx);
      r.height = 20;

      r.getCell(1).value = formationCount;
      r.getCell(2).value = nomComplet;
      r.getCell(3).value = poste;
      r.getCell(4).value = direction;
      r.getCell(5).value = n1;
      r.getCell(6).value = f.intitule || f.formation || "Formation";
      r.getCell(7).value = f.delai || "Court terme";
      r.getCell(8).value = f.priorite || "Normale";
      r.getCell(9).value = f.objectifVise || f.description || "Renforcement des compétences";

      for (let c = 1; c <= 9; c++) {
        const cell = r.getCell(c);
        cell.font = { name: FONT_FAMILY, size: 9, color: { argb: "FF0F172A" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: formationCount % 2 === 1 ? "FFF8FAFC" : "FFFFFFFF" } };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }
      r.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      r.getCell(7).alignment = { vertical: "middle", horizontal: "center" };
      r.getCell(8).alignment = { vertical: "middle", horizontal: "center" };

      fRowIdx++;
    });
  });

  if (formationCount === 0) {
    const emptyRow = wsFormations.getRow(4);
    emptyRow.height = 24;
    wsFormations.mergeCells("A4:I4");
    const eCell = wsFormations.getCell("A4");
    eCell.value = "Aucun besoin de formation spécifique n'a été consigné pour le moment.";
    eCell.font = { name: FONT_FAMILY, size: 9.5, italic: true, color: { argb: "FF64748B" } };
    eCell.alignment = { vertical: "middle", horizontal: "center" };
  }

  // ══════════════════════════════════════════════════════════════
  // TÉLÉCHARGEMENT DU FICHIER .XLSX DANS LE NAVIGATEUR
  // ══════════════════════════════════════════════════════════════
  const annee = cycle?.annee || new Date().getFullYear();
  const fileName = `AGILLY_RHEVAL_POINT_CAMPAGNE_RH_${annee}.xlsx`;

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

