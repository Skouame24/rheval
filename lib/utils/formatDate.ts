// ============================================================
// lib/utils/formatDate.ts
// Formatage de dates en français
// ============================================================

const LOCALE = "fr-FR";

/**
 * Formate une date ISO en date courte : "27 juil. 2025"
 */
export function formatDateCourte(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formate une date ISO en date longue : "27 juillet 2025"
 */
export function formatDateLongue(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formate une date ISO avec heure : "27 juil. 2025 à 14:30"
 */
export function formatDateHeure(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Retourne une durée relative : "Il y a 2 jours", "Dans 3 jours"
 */
export function formatDateRelative(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  if (days === -1) return "Hier";
  if (days > 1) return `Dans ${days} jours`;
  return `Il y a ${Math.abs(days)} jours`;
}

/**
 * Retourne l'année seule : 2025
 */
export function getAnnee(isoDate: string): number {
  return new Date(isoDate).getFullYear();
}
