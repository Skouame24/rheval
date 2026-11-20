// ============================================================
// features/portail/data/directions.ts
// Couleur stable par direction (classes Tailwind littérales)
// ============================================================

export interface CouleurDirection {
  dot: string;
  text: string;
  soft: string;
  softBorder: string;
  gradient: string;
}

const PALETTE: CouleurDirection[] = [
  { dot: "bg-agilly-primary", text: "text-agilly-primary", soft: "bg-orange-50", softBorder: "border-orange-100", gradient: "from-orange-100 via-orange-50 to-amber-50" },
  { dot: "bg-emerald-600", text: "text-emerald-700", soft: "bg-emerald-50", softBorder: "border-emerald-100", gradient: "from-emerald-100 via-emerald-50 to-teal-50" },
  { dot: "bg-blue-600", text: "text-blue-700", soft: "bg-blue-50", softBorder: "border-blue-100", gradient: "from-blue-100 via-blue-50 to-sky-50" },
  { dot: "bg-violet-600", text: "text-violet-700", soft: "bg-violet-50", softBorder: "border-violet-100", gradient: "from-violet-100 via-violet-50 to-fuchsia-50" },
  { dot: "bg-amber-500", text: "text-amber-700", soft: "bg-amber-50", softBorder: "border-amber-100", gradient: "from-amber-100 via-amber-50 to-yellow-50" },
  { dot: "bg-rose-500", text: "text-rose-700", soft: "bg-rose-50", softBorder: "border-rose-100", gradient: "from-rose-100 via-rose-50 to-pink-50" },
  { dot: "bg-cyan-600", text: "text-cyan-700", soft: "bg-cyan-50", softBorder: "border-cyan-100", gradient: "from-cyan-100 via-cyan-50 to-sky-50" },
  { dot: "bg-slate-500", text: "text-slate-700", soft: "bg-slate-100", softBorder: "border-slate-200", gradient: "from-slate-200 via-slate-100 to-slate-50" },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function couleurDirection(direction: string): CouleurDirection {
  if (direction === "Non renseignée") return PALETTE[PALETTE.length - 1];
  return PALETTE[hash(direction) % (PALETTE.length - 1)];
}

/** "Direction des Ressources Humaines" → "Ressources Humaines" */
export function libelleCourt(direction: string): string {
  return direction.replace(/^Direction (des |de la |de l'|du |de |)/i, "");
}
