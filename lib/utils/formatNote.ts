// ============================================================
// lib/utils/formatNote.ts
// Calculs et formatages liés aux notes et au bonus
// ============================================================

/**
 * Convertit une note /20 en taux d'atteinte en %
 * Ex: 15 → 75
 */
export function noteToTauxAtteinte(note: number): number {
  return Math.round((note / 20) * 100 * 10) / 10; // Arrondi à 1 décimale
}

/**
 * Formate un taux d'atteinte pour l'affichage
 * Ex: 75 → "75 %"
 */
export function formatTaux(taux: number): string {
  return `${taux.toFixed(1)} %`;
}

/**
 * Formate une note sur 20
 * Ex: 15 → "15 / 20"
 */
export function formatNote(note: number): string {
  return `${note.toFixed(1)} / 20`;
}

/**
 * Formate un taux de bonus
 * Ex: 15 → "+15 %"
 */
export function formatTauxBonus(taux: number): string {
  return `+${taux} %`;
}

/**
 * Calcule la moyenne pondérée de notes
 * @param notes - Liste de { note: number, ponderation: number }
 * @returns Moyenne pondérée /20
 */
export function calculerMoyennePonderee(
  notes: { note: number; ponderation: number }[]
): number {
  const totalPonderation = notes.reduce((sum, n) => sum + n.ponderation, 0);
  if (totalPonderation === 0) return 0;
  const somme = notes.reduce((sum, n) => sum + n.note * n.ponderation, 0);
  return Math.round((somme / totalPonderation) * 10) / 10;
}

/**
 * Retourne le palier de couleur selon le taux d'atteinte
 */
export function getCouleurTaux(taux: number): {
  color: string;
  bg: string;
  label: string;
} {
  if (taux >= 90) return { color: "#059669", bg: "#ECFDF5", label: "Excellent" };
  if (taux >= 75) return { color: "#2563EB", bg: "#EFF6FF", label: "Très bien" };
  if (taux >= 60) return { color: "#D97706", bg: "#FFFBEB", label: "Satisfaisant" };
  return { color: "#DC2626", bg: "#FEF2F2", label: "Insuffisant" };
}
