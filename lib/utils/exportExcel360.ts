// ============================================================
// lib/utils/exportExcel360.ts
// Générateur Excel (.xlsx) pour l'Évaluation 360° AGILLY RHEVAL
// Format 1:1 conforme au modèle officiel AGILLY
// ============================================================

import * as XLSX from "xlsx";

interface Export360Data {
  managerData: {
    nomPrenoms: string;
    fonction: string;
    dateEmbauche: string;
    service: string;
  };
  domaines: {
    titre: string;
    criteres: {
      comportement: string;
      note: number;
    }[];
  }[];
  formations: { intitule: string; delai: string }[];
  observationComite?: string;
  isSalarie?: boolean;
}

export function export360ToExcel(data: Export360Data) {
  const wb = XLSX.utils.book_new();

  // ── FEUILLE 1 : Eval 360° Encadrants ──
  const wsRows: (string | number)[][] = [];

  // Lignes 1-3 : Titre principal
  wsRows.push([]);
  wsRows.push([]);
  wsRows.push(["", "EVALUATION A 360° 2026 - MANAGERS ET CHEFS D'EQUIPE"]);
  wsRows.push([]);

  // Ligne 5 : Informations Manager
  wsRows.push(["", "Informations Manager ou Chef d'équipe à évaluer"]);
  wsRows.push([]);
  wsRows.push(["", "Nom & Prenoms :", data.managerData.nomPrenoms]);
  wsRows.push(["", "Fonction:", data.managerData.fonction]);
  wsRows.push(["", "Date d'embauche:", data.managerData.dateEmbauche]);
  wsRows.push(["", "Service:", data.managerData.service]);
  wsRows.push([]);

  // Ligne 13 : En-tête Grille 360°
  wsRows.push(["", "EVALUATION COMPETENCES 360° - MANAGERS ET CHEFS D'EQUIPE"]);
  wsRows.push([
    "",
    "Description synthétique du niveau de compétence",
    "Comportement observable",
    "Note/5",
    "Moyenne /5",
  ]);

  // Contenu des domaines
  data.domaines.forEach((dom) => {
    const totalNotes = dom.criteres.reduce((acc, c) => acc + c.note, 0);
    const moyenneDomaine = (dom.criteres.length > 0 ? totalNotes / dom.criteres.length : 0).toFixed(2);

    dom.criteres.forEach((critere, index) => {
      wsRows.push([
        "",
        index === 0 ? dom.titre : "",
        critere.comportement,
        critere.note,
        index === 0 ? Number(moyenneDomaine) : "",
      ]);
    });
  });

  wsRows.push([]);

  // Ratios / Synthèse >= 3 et <= 3
  const superieures3: string[] = [];
  const inferieures3: string[] = [];

  data.domaines.forEach((dom) => {
    dom.criteres.forEach((c) => {
      if (c.note >= 3) superieures3.push(`${c.comportement} (${c.note}/5)`);
      if (c.note <= 3) inferieures3.push(`${c.comportement} (${c.note}/5)`);
    });
  });

  wsRows.push(["", "Rubriques ayant > ou = 3:", superieures3.join(" | ")]);
  wsRows.push(["", "Rubriques ayant < ou = 3:", inferieures3.join(" | ")]);
  wsRows.push([]);

  // Formations à envisager
  wsRows.push(["", "Formation à envisager", "Délai prévisionnel"]);
  data.formations.forEach((f) => {
    wsRows.push(["", f.intitule, f.delai]);
  });
  wsRows.push([]);

  // Observation comité restreint (Uniquement si pas salarié)
  if (!data.isSalarie && data.observationComite) {
    wsRows.push(["", "Observation comité restreint (PDG, Directeur Exécutif et DRH)"]);
    wsRows.push(["", data.observationComite]);
  }

  const ws = XLSX.utils.aoa_to_sheet(wsRows);

  // Définir la largeur des colonnes
  ws["!cols"] = [
    { wch: 4 },  // A
    { wch: 42 }, // B: Domaine / Titre
    { wch: 70 }, // C: Comportement observable
    { wch: 12 }, // D: Note/5
    { wch: 15 }, // E: Moyenne /5
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Eval 360° Encadrants");

  // ── FEUILLE 2 : Eval compétences Managers ──
  const ws2 = XLSX.utils.aoa_to_sheet(wsRows);
  ws2["!cols"] = ws["!cols"];
  XLSX.utils.book_append_sheet(wb, ws2, "Eval compétences Managers");

  // ── FEUILLE 3 : Eval compétences non encadrants ──
  const ws3 = XLSX.utils.aoa_to_sheet([
    ["", "EVALUATION COMPETENCES NON ENCADRANTS"],
    ["", "Modèle standard pour le personnel d'exécution"],
  ]);
  XLSX.utils.book_append_sheet(wb, ws3, "Eval compétences non encadrants");

  // Nom du fichier personnalisé
  const fileName = `AGILLY_RHEVAL_Eval360_${data.managerData.nomPrenoms.replace(/\s+/g, "_")}.xlsx`;

  // Génération et téléchargement du fichier .xlsx
  XLSX.writeFile(wb, fileName);
}
